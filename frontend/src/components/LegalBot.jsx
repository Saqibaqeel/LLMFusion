import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import './index.css'; // Ensure you have the correct path to your CSS file

const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';

const LegalBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognition = useRef(null);
  const synthesis = useRef(null);
  const messagesEndRef = useRef(null);

  const languages = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    ur: 'Urdu'
  };

  const voiceConfig = {
    en: { lang: 'en-US', rate: 1.0 },
    hi: { lang: 'hi-IN', rate: 0.9 },
    te: { lang: 'te-IN', rate: 0.85 },
    ta: { lang: 'ta-IN', rate: 0.85 },
    ur: { lang: 'ur-PK', rate: 0.8 }
  };

  // Speech Recognition Setup (same as MedicalBot)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.maxAlternatives = 1;

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };

      recognition.current.onerror = () => setIsRecording(false);
      recognition.current.onend = () => setIsRecording(false);
    }
  }, []);

  // Speech Synthesis Setup (same as MedicalBot)
  useEffect(() => {
    synthesis.current = window.speechSynthesis;
    const updateVoices = () => {
      const voices = synthesis.current.getVoices();
      const config = voiceConfig[selectedLanguage];
      const voice = voices.find(v => v.lang === config.lang) || voices[0];
      if (voice) synthesis.current.voice = voice;
    };
    
    synthesis.current.addEventListener('voiceschanged', updateVoices);
    return () => synthesis.current.removeEventListener('voiceschanged', updateVoices);
  }, [selectedLanguage]);

  const toggleRecording = () => {
    if (!recognition.current) return;
    isRecording ? recognition.current.stop() : recognition.current.start();
    setIsRecording(!isRecording);
  };

  const speak = (text) => {
    if (!synthesis.current) return;
    if (isSpeaking) {
      synthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synthesis.current.voice;
    utterance.rate = voiceConfig[selectedLanguage].rate;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesis.current.speak(utterance);
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInputMessage('');
    setLoading(true);

    try {
      const prompt = `As a legal expert (respond in ${languages[selectedLanguage]}), answer: "${userMessage}"
        Include:
        - Legal provisions
        - Contract analysis
        - Compliance requirements
        - Dispute resolution options
        - Documentation guidance
        - Risk assessment
        Always add disclaimer: "Not a substitute for professional legal advice"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not understand the question.';

      setMessages(prev => [...prev, { text: responseText, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="row h-100">
        {/* Information Panel */}
        <div className="col-md-3 p-3 border-end bg-white">
          <div className="d-flex align-items-center mb-4">
            <i className="fas fa-balance-scale fa-2x text-purple me-3"></i>
            <h2 className="h4 mb-0 text-purple">Legal Assistant</h2>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-purple text-white">
              <i className="fas fa-info-circle me-2"></i>
              How It Works
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-3">
                  <i className="fas fa-file-contract text-purple me-2"></i>
                  Contract Review
                </li>
                <li className="mb-3">
                  <i className="fas fa-gavel text-purple me-2"></i>
                  Legal Document Analysis
                </li>
                <li className="mb-3">
                  <i className="fas fa-handshake text-purple me-2"></i>
                  Dispute Guidance
                </li>
                <li className="mb-3">
                  <i className="fas fa-shield-alt text-purple me-2"></i>
                  Compliance Checks
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-purple text-white">
              <i className="fas fa-plus-square me-2"></i>
              Quick Actions
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <button className="btn btn-outline-purple w-100">
                    <i className="fas fa-search me-2"></i>
                    Find Lawyers
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-outline-purple w-100">
                    <i className="fas fa-file-alt me-2"></i>
                    Templates
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-outline-purple w-100">
                    <i className="fas fa-balance-scale-left me-2"></i>
                    Legal Aid
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-outline-purple w-100">
                    <i className="fas fa-briefcase me-2"></i>
                    Case Track
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="col-md-9 d-flex flex-column">
          <div className="bg-purple text-white p-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="fas fa-balance-scale-left fa-lg me-3"></i>
              <h2 className="h5 mb-0">Legal Assistant</h2>
            </div>
            <div className="d-flex align-items-center gap-3">
              <select 
                className="form-select form-select-sm bg-white"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-light btn-sm"
              >
                <i className="fas fa-home me-2"></i>
                Home
              </button>
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto p-3 bg-light">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`d-flex mb-3 ${message.isBot ? 'justify-content-start' : 'justify-content-end'}`}
              >
                <div className={`p-3 rounded-3 ${message.isBot ? 'bg-white' : 'bg-purple text-white'}`}
                     style={{ maxWidth: '80%' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="flex-grow-1">{message.text}</div>
                    {message.isBot && (
                      <button 
                        onClick={() => speak(message.text)}
                        className={`btn btn-link p-0 ${isSpeaking ? 'text-muted' : 'text-purple'}`}
                      >
                        <i className={`fas ${isSpeaking ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-center">
                <div className="spinner-border text-purple" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-top p-3 bg-white">
            <div className="input-group">
              <button 
                className={`btn ${isRecording ? 'btn-danger' : 'btn-purple'}`}
                onClick={toggleRecording}
              >
                <i className={`fas ${isRecording ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
              </button>
              <input
                type="text"
                className="form-control"
                placeholder="Describe your legal issue or ask a question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                className="btn btn-purple"
                onClick={handleSend}
                disabled={loading}
              >
                Send
              </button>
            </div>
            <div className="text-center text-muted small mt-2">
              Try: "Review my rental agreement" or "Explain copyright laws"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalBot;