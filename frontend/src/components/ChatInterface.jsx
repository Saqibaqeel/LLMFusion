import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../store/UseAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaVolumeUp, FaVolumeMute, FaMicrophone, FaStopCircle, FaSun, FaMoon, FaPaperPlane, FaSignOutAlt } from 'react-icons/fa';

const LANGUAGES = {
  en: { name: 'English', native: 'English', code: 'en', voiceCode: 'en-US' },
  hi: { name: 'Hindi', native: 'हिन्दी', code: 'hi', voiceCode: 'hi-IN' },
  te: { name: 'Telugu', native: 'తెలుగు', code: 'te', voiceCode: 'te-IN' },
  ta: { name: 'Tamil', native: 'தமிழ்', code: 'ta', voiceCode: 'ta-IN' },
  ur: { name: 'Urdu', native: 'اردو', code: 'ur', voiceCode: 'ur-PK' }
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
  const [abortController, setAbortController] = useState(new AbortController());
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const synthesis = useRef(window.speechSynthesis);
  const recognition = useRef(null);
  const utterance = useRef(null);

  // Speech initialization
  useEffect(() => {
    // Initialize speech recognition
    recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = LANGUAGES[selectedLanguage].voiceCode;

    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };

    recognition.current.onerror = () => setIsRecording(false);

    // Initialize speech synthesis
    const updateVoices = () => {
      const voices = synthesis.current.getVoices();
      if (voices.length > 0) {
        utterance.current = new SpeechSynthesisUtterance();
        const langVoice = voices.find(v => v.lang === LANGUAGES[selectedLanguage].voiceCode);
        utterance.current.voice = langVoice || voices[0];
        utterance.current.lang = langVoice?.lang || voices[0]?.lang;
      }
    };

    // Load voices initially
    updateVoices();
    
    synthesis.current.addEventListener('voiceschanged', updateVoices);
    return () => {
      synthesis.current?.removeEventListener('voiceschanged', updateVoices);
      synthesis.current?.cancel();
    };
  }, [selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatModelName = (model) => {
    const [provider, name] = model.split('/');
    return `${provider.charAt(0).toUpperCase() + provider.slice(1)} ${name.split('-')[0].toUpperCase()}`;
  };

  const handleStop = () => {
    abortController.abort();
    setIsLoading(false);
    setMessages((prev) => [
      ...prev,
      { content: '⏹️ Response generation stopped', isBot: true, error: true },
    ]);
    setAbortController(new AbortController());
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    if (!isLogout) {
      logout();
      navigate('/');
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      synthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!utterance.current || !synthesis.current) {
      console.error('Speech synthesis not available');
      return;
    }

    try {
      const voices = synthesis.current.getVoices();
      utterance.current.text = text;
      utterance.current.voice = voices.find(v => v.lang === LANGUAGES[selectedLanguage].voiceCode) || voices[0];
      utterance.current.lang = LANGUAGES[selectedLanguage].voiceCode;
      
      utterance.current.onend = () => setIsSpeaking(false);
      utterance.current.onerror = (err) => {
        console.error('Speech error:', err);
        setIsSpeaking(false);
      };

      synthesis.current.speak(utterance.current);
      setIsSpeaking(true);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      synthesis.current.cancel();
      const newController = new AbortController();
      setAbortController(newController);

      setMessages(prev => [...prev, { content: input, isBot: false }]);

      const response = await axios.post(
        'http://localhost:3000/api/ml/judgeAndGenerate',
        { 
          prompt: input,
          language: selectedLanguage
        },
        { signal: newController.signal }
      );

      const botMessage = {
        content: response.data.bestResponse,
        isBot: true,
        model: response.data.chosenModel,
        candidates: response.data.candidates,
        responseTime: response.data.responseTime,
      };

      setMessages(prev => [...prev, botMessage]);
      setInput('');
    } catch (error) {
      if (!axios.isCancel(error)) {
        setMessages(prev => [...prev, {
          content: '⚠️ Failed to get response. Please try again.',
          isBot: true,
          error: true,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch(selectedLanguage) {
      case 'te': return 'ఏదైనా ప్రశ్న అడగండి...';
      case 'hi': return 'कोई प्रश्न पूछें...';
      case 'ta': return 'எந்த கேள்வியையும் கேளுங்கள்...';
      case 'ur': return 'کوئی سوال پوچھیں...';
      default: return 'Ask your question...';
    }
  };

  return (
    <div className={`h-100 d-flex flex-column ${isDarkMode ? 'bg-dark text-white' : 'bg-white'}`}>
      {/* Header Controls */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <div className="d-flex gap-2">
          <select 
            className={`form-select form-select-sm ${
              isDarkMode ? 'bg-dark text-light border-dark' : 'bg-light'
            }`}
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {Object.values(LANGUAGES).map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.name})
              </option>
            ))}
          </select>
          
          {isLoading && (
            <button
              className={`btn btn-danger btn-sm ${isDarkMode ? 'text-white' : ''}`}
              onClick={handleStop}
            >
              <FaStopCircle className="me-2" />
              Stop
            </button>
          )}
          <button
            className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </button>
        </div>

        <button
          className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow-1 overflow-auto p-3">
        {messages.map((msg, index) => (
          <div key={index} className={`d-flex ${msg.isBot ? '' : 'justify-content-end'} mb-3`}>
            <div
              className={`rounded p-3 position-relative ${
                msg.isBot
                  ? isDarkMode
                    ? 'bg-secondary text-white'
                    : 'bg-light'
                  : isDarkMode
                  ? 'bg-primary text-white'
                  : 'bg-primary text-white'
              }`}
              style={{ maxWidth: 'min(85%, 800px)' }}
            >
              {msg.isBot && (
                <>
                  <button 
                    className="btn btn-link p-0"
                    onClick={() => toggleSpeech(msg.content)}
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      color: isDarkMode ? '#fff' : '#000',
                      zIndex: 1
                    }}
                  >
                    {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>

                  <div className="d-flex flex-wrap align-items-center mb-2 gap-2">
                    <div className="d-flex align-items-center">
                      <FaMicrophone className={`${isDarkMode ? 'text-light' : 'text-muted'} fs-6 me-2`} />
                      <small className={`${isDarkMode ? 'text-light' : 'text-muted'} fw-medium`}>
                        {formatModelName(msg.model)}
                        <span className="mx-2">•</span>
                        <span className="text-success">{msg.responseTime}ms</span>
                      </small>
                    </div>

                    <div className="d-flex gap-1 flex-wrap">
                      {msg.candidates?.map((model, idx) => (
                        <span
                          key={idx}
                          className={`badge ${model === msg.model ? 'bg-success' : isDarkMode ? 'bg-light text-dark' : 'bg-secondary'} py-1 px-2`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {model.split('/')[1].split('-')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div 
                className={msg.isBot && !isDarkMode ? 'text-dark' : 'text-white'}
                style={{ paddingBottom: '24px' }}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={`border-top p-3 ${isDarkMode ? 'bg-dark' : ''}`}>
        <div className="input-group">
          <button
            type="button"
            className={`btn ${isRecording ? 'btn-danger' : isDarkMode ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={handleVoiceInput}
          >
            {isRecording ? <FaStopCircle /> : <FaMicrophone />}
          </button>
          <input
            type="text"
            className={`form-control ${isDarkMode ? 'bg-secondary text-white border-dark' : ''}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLoading}
          />
          <button
            className={`btn ${isLoading ? 'btn-danger' : 'btn-primary'}`}
            type={isLoading ? 'button' : 'submit'}
            onClick={isLoading ? handleStop : null}
            disabled={!input.trim() && !isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Loading...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Send
              </>
            )}
          </button>
        </div>
        <small className={`mt-2 d-block ${isDarkMode ? 'text-light' : 'text-muted'}`}>
          Press Enter to send • Click speaker icon to hear responses
        </small>
      </form>
    </div>
  );
};

export default ChatInterface;