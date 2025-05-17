import React, { useState, useRef, useEffect, useCallback } from 'react';
import useAuth from '../store/UseAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaVolumeUp, FaVolumeMute, FaMicrophone, FaStopCircle, 
  FaSun, FaMoon, FaPaperPlane, FaSignOutAlt, FaInfoCircle 
} from 'react-icons/fa';

const LANGUAGES = {
  en: { name: 'English', native: 'English', code: 'en', voiceCode: 'en-US' },
  hi: { name: 'Hindi', native: 'हिन्दी', code: 'hi', voiceCode: 'hi-IN' },
  te: { name: 'Telugu', native: 'తెలుగు', code: 'te', voiceCode: 'te-IN' },
  ta: { name: 'Tamil', native: 'தமிழ்', code: 'ta', voiceCode: 'ta-IN' },
  ur: { name: 'Urdu', native: 'اردو', code: 'ur', voiceCode: 'ur-PK' }
};

const NVIDIA_MODELS = {
  'meta/llama3-70b-instruct': 'Llama 3 (70B)',
  'google/gemma-7b': 'Gemma (7B)',
  'deepseek-ai/deepseek-r1-distill-llama-8b': 'DeepSeek-R1 (8B)',
  'nvidia/nemotron-3-8b-base-4k': 'Nemotron-3 (8B)',
  'mistralai/mistral-7b-instruct': 'Mistral (7B)'
};

const ChatInterface = () => {
  const navigate = useNavigate();
  const { logout, isLogout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [abortController] = useState(() => new AbortController());
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const synthesis = useRef(null);
  const recognition = useRef(null);

  // Speech initialization
  useEffect(() => {
    synthesis.current = window.speechSynthesis || null;

    const initializeSpeechRecognition = () => {
      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        recognition.current.lang = LANGUAGES[selectedLanguage].voiceCode;

        recognition.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
        };

        recognition.current.onerror = () => {
          setIsRecording(false);
          console.error('Speech recognition error');
        };
      }
    };

    initializeSpeechRecognition();

    return () => {
      synthesis.current?.cancel();
      recognition.current?.stop();
    };
  }, [selectedLanguage]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => scrollToBottom(), [messages, scrollToBottom]);

  const handleStop = useCallback(() => {
    abortController.abort();
    setIsLoading(false);
    setMessages(prev => [...prev, {
      content: '⏹️ Response generation stopped',
      isBot: true,
      error: true
    }]);
  }, [abortController]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const handleLogout = useCallback(() => {
    if (!isLogout) {
      logout();
      navigate('/');
    }
  }, [isLogout, logout, navigate]);

  const handleVoiceInput = useCallback(() => {
    if (!recognition.current) return;
    isRecording ? recognition.current.stop() : recognition.current.start();
    setIsRecording(!isRecording);
  }, [isRecording]);

  const toggleSpeech = useCallback((text) => {
    if (!synthesis.current) return;
    
    if (isSpeaking) {
      synthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synthesis.current.getVoices().find(
      v => v.lang === LANGUAGES[selectedLanguage].voiceCode
    );
    
    utterance.onend = utterance.onerror = () => setIsSpeaking(false);
    synthesis.current.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking, selectedLanguage]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      synthesis.current?.cancel();
      
      const userMessage = { content: input, isBot: false };
      setMessages(prev => [...prev, userMessage]);

      const response = await axios.post('http://localhost:3000/api/ml/analyzeAndRespond', {
        prompt: input,
        language: selectedLanguage
      }, {
        signal: abortController.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      const botMessage = {
        content: response.data.response,
        isBot: true,
        model: response.data.model,
        responseTime: response.data.responseTime,
        cached: response.data.cachedCategory
      };

      setMessages(prev => [...prev, botMessage]);
      setInput('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
        error.request ? 'Server not responding' : 
        'Failed to process request';
      
      setMessages(prev => [...prev, {
        content: `⚠️ ${errorMessage}`,
        isBot: true,
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedLanguage, abortController]);

  return (
    <div className={`chat-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <select
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
          className="language-select"
        >
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <option key={code} value={code}>
              {lang.native} ({lang.name})
            </option>
          ))}
        </select>

        <div className="controls">
          <button onClick={toggleDarkMode}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
            <div className={`content ${msg.error ? 'error' : ''}`}>
              {msg.isBot && (
                <div className="meta-info">
                  <span className="model">
                    {NVIDIA_MODELS[msg.model] || msg.model}
                  </span>
                  <span className="time">{msg.responseTime}ms</span>
                  {msg.cached && <span className="cached">CACHED</span>}
                </div>
              )}
              {msg.content}
              {msg.isBot && !msg.error && (
                <button 
                  className="speech-btn"
                  onClick={() => toggleSpeech(msg.content)}
                >
                  {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <button
            type="button"
            className={`voice-btn ${isRecording ? 'active' : ''}`}
            onClick={handleVoiceInput}
          >
            <FaMicrophone />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : <FaPaperPlane />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;