const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');

const modelCache = new Map();
const MODEL_LIST = [
    'meta/llama3-70b-instruct',
    'google/gemma-7b',
    'deepseek-ai/deepseek-r1-distill-llama-8b'
];

const judgeAndGenerate = async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Call models with retries and extended timeout
        const modelPromises = MODEL_LIST.map(model => 
            callModelWithRetry(model, prompt, 2)
        );

        const results = await Promise.allSettled(modelPromises);
        const candidates = results
            .map((result, idx) => result.status === 'fulfilled' && result.value 
                ? { model: MODEL_LIST[idx], content: result.value }
                : null)
            .filter(Boolean);

        if (!candidates.length) {
            return res.status(500).json({ error: 'All model calls failed' });
        }

        // Enhanced judgment with validation
        const best = await judgeResponses(prompt, candidates);
        
        res.json({
            bestResponse: best.content,
            chosenModel: best.model,
            responseTime: Date.now() - startTime,
            candidates: candidates.map(c => c.model)
        });

    } catch (error) {
        console.error(`Request failed: ${error.message}`);
        res.status(500).json({ 
            error: 'Processing error',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
};

async function callModelWithRetry(model, prompt, retries) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await callModel(model, prompt);
        } catch (error) {
            if (attempt === retries) {
                console.error(`Model ${model} failed after ${retries} retries`);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        }
    }
}

async function callModel(model, prompt) {
    const cacheKey = `${model}-${prompt}`;
    if (modelCache.has(cacheKey)) {
        return modelCache.get(cacheKey);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

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
            throw new Error(`API error ${response.status}: ${errorBody.slice(0, 100)}`);
        }

        const data = await response.json();
        const result = data.choices[0].message.content;
        
        modelCache.set(cacheKey, result);
        return result;

    } catch (error) {
        console.error(`Model ${model} failed: ${error.message}`);
        throw error;
    }
}

async function judgeResponses(prompt, candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        const judgePrompt = `STRICTLY REPLY WITH 0, 1, or 2 ONLY. 
Which response best answers: "${prompt}"?

${candidates.map((c, i) => `=== OPTION ${i} ===
${c.content.slice(0, 150)}...`).join('\n\n')}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: judgePrompt }]
                    }],
                    generationConfig: { // Correct placement
                        maxOutputTokens: 10,
                        temperature: 0.1,
                        topP: 0.95
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Gemini raw response:', responseText);

        const bestIndex = parseBestIndex(responseText, candidates.length);
        return candidates[bestIndex];

    } catch (error) {
        console.error('Judgment failed:', error.message);
        return candidates[Math.floor(Math.random() * candidates.length)]; // Random fallback
    }
}

function parseBestIndex(text, candidateCount) {
    try {
        const numberMatch = text.match(/\d+/);
        if (!numberMatch) throw new Error('No numbers found');
        
        let index = parseInt(numberMatch[0]);
        index = Math.max(0, Math.min(index, candidateCount - 1));
        
        console.log(`Valid index selected: ${index}`);
        return index;
    } catch (error) {
        console.error('Index parsing failed, using random selection');
        return Math.floor(Math.random() * candidateCount);
    }
}
const createCustomBoat=async (req,res)=>{
    try {
        const {title,instruction} = req.body;
        if (!title || !instruction) {
            return res.status(400).json({ error: 'Title and instruction are required' });
        }
        
    } catch (error) {
        
    }

}

module.exports = { judgeAndGenerate };


// CRITERIA:
// - Relevance to the prompt 
// - Factual accuracy
// - Clarity and completeness
// - Conciseness (avoid fluff)

// STRICTLY REPLY WITH 0, 1, or 2 ONLY. 

// Prompt: "<prompt>"

// === OPTION 0 ===
// ...

// === OPTION 1 ===
// ...

// === OPTION 2 ===
// ...