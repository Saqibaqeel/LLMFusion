const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');
const { RateLimiter } = require('limiter');

// Verify API keys on startup
if (!process.env.NVIDIA_API_KEY || !process.env.GEMINI_API_KEY) {
  throw new Error('Missing API keys in environment variables');
}

const modelCache = new Map();
const MODEL_LIST = [
    'meta/llama3-70b-instruct',
    'google/gemma-7b',
    'deepseek-ai/deepseek-r1-distill-llama-8b'
];

const JUDGE_CONFIG = {
    maxRetries: 3,
    retryDelay: 2000,
    judgeRateLimiter: new RateLimiter({ tokensPerInterval: 5, interval: 'second' })
};

const judgeAndGenerate = async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { prompt } = req.body;
        if (!prompt?.trim()) {
            return res.status(400).json({ error: 'Non-empty prompt is required' });
        }

        const candidates = await getModelResponses(prompt);
        if (!candidates.length) {
            return res.status(503).json({
                error: 'All model providers failed',
                mitigation: 'Try again with a different prompt'
            });
        }

        const best = await judgeResponses(prompt, candidates);
        
        res.json({
            bestResponse: best.content,
            chosenModel: best.model,
            responseTime: Date.now() - startTime,
            candidates: candidates.map(c => c.model),
            ...(best.judgmentError && { warning: best.judgmentError })
        });

    } catch (error) {
        console.error(`Request failed: ${error.stack}`);
        res.status(500).json({ 
            error: 'Processing error',
            ...(process.env.NODE_ENV === 'development' && { 
                details: error.message,
                stack: error.stack 
            })
        });
    }
};

async function getModelResponses(prompt) {
    const results = await Promise.allSettled(
        MODEL_LIST.map(model => 
            callModelWithRetry(model, prompt, JUDGE_CONFIG.maxRetries)
        )
    );

    return results
        .map((result, idx) => {
            if (result.status === 'fulfilled') {
                return {
                    model: MODEL_LIST[idx],
                    content: result.value,
                    timestamp: Date.now()
                };
            }
            console.warn(`Model ${MODEL_LIST[idx]} failed: ${result.reason.message}`);
            return null;
        })
        .filter(c => c?.content?.length >= 20);
}

async function judgeResponses(prompt, candidates) {
    await JUDGE_CONFIG.judgeRateLimiter.removeTokens(1);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // Extended timeout

    try {
        const judgePrompt = `Select the best response (0-${candidates.length-1}) for: "${prompt}"\n\n${
            candidates.map((c, i) => `OPTION ${i}:\n${c.content.slice(0, 200)}`).join('\n\n')
        }\n\nReply ONLY with the number.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: judgePrompt }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 10,
                        temperature: 0.1
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeout);
        
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error ${response.status}: ${errorBody.slice(0, 100)}`);
        }

        const data = await response.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        return candidates[parseBestIndex(responseText, candidates.length)];

    } catch (error) {
        console.error(`Judgment failed: ${error.message}`);
        return weightedRandomSelect(candidates);
    }
}

function parseBestIndex(text, candidateCount) {
    try {
        // Handle common Gemini response patterns
        const cleanText = text
            .replace(/["']/g, '')
            .replace(/option/gi, '')
            .trim();

        const numberMatch = cleanText.match(/^\d+$/);
        if (!numberMatch) throw new Error('No valid number found');
        
        const index = parseInt(numberMatch[0]);
        return Math.max(0, Math.min(index, candidateCount - 1));
        
    } catch (error) {
        console.warn(`Index parsing failed: ${error.message}`);
        return Math.floor(Math.random() * candidateCount);
    }
}

function weightedRandomSelect(candidates) {
    // Simple fallback: prefer first model
    return candidates[0];
}

async function callModelWithRetry(model, prompt, retries) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await callModel(model, prompt);
        } catch (error) {
            if (attempt === retries) throw error;
            await new Promise(resolve => setTimeout(
                resolve, 
                JUDGE_CONFIG.retryDelay * (attempt + 1)
            ));
        }
    }
}

async function callModel(model, prompt) {
    const cacheKey = `${model}-${Buffer.from(prompt).toString('base64url')}`;
    if (modelCache.has(cacheKey)) return modelCache.get(cacheKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 512,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);
        
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`NVIDIA API ${response.status}: ${errorBody.slice(0, 100)}`);
        }

        const data = await response.json();
        
        if (!data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from model');
        }

        const result = data.choices[0].message.content;
        modelCache.set(cacheKey, result);
        return result;

    } catch (error) {
        console.error(`Model ${model} failed: ${error.message}`);
        throw error;
    }
}

module.exports = { judgeAndGenerate };