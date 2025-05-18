import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../store/UseAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = {
  en: { name: 'English', native: 'English', code: 'en', voiceCode: 'en-US' },
  hi: { name: 'Hindi', native: 'हिन्दी', code: 'hi', voiceCode: 'hi-IN' },
  ar: { name: 'Arabic', native: 'العربية', code: 'ar', voiceCode: 'ar-SA' },
  te: { name: 'Telugu', native: 'తెలుగు', code: 'te', voiceCode: 'te-IN' },
  ta: { name: 'Tamil', native: 'தமிழ்', code: 'ta', voiceCode: 'ta-IN' },
  ur: { name: 'Urdu', native: 'اردو', code: 'ur', voiceCode: 'ur-PK' }
};

const ChooseBot = () => {
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

  useEffect(() => {
    recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = LANGUAGES[selectedLanguage].voiceCode;
    recognition.current.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.current.onerror = () => setIsRecording(false);

    const loadVoices = () => {
      const voices = synthesis.current.getVoices();
      if (voices.length) {
        utterance.current = new SpeechSynthesisUtterance();
        const voice = voices.find(v => v.lang === LANGUAGES[selectedLanguage].voiceCode);
        utterance.current.voice = voice || voices[0];
        utterance.current.lang = utterance.current.voice.lang;
      }
    };
    loadVoices();
    synthesis.current.addEventListener('voiceschanged', loadVoices);

    return () => {
      synthesis.current.removeEventListener('voiceschanged', loadVoices);
      synthesis.current.cancel();
    };
  }, [selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages(prev => prev.map(msg => ({
      ...msg,
      content: msg.content.replace(/<think>.*?<\/think>/gs, '')
    })));
  }, []);

  const formatModelName = (modelId) => {
    const [provider, name] = modelId.split('/');
    return `${provider.charAt(0).toUpperCase() + provider.slice(1)} ${name.split('-')[0].toUpperCase()}`;
  };

  const handleStop = () => {
    abortController.abort();
    setIsLoading(false);
    setMessages(prev => [
      ...prev,
      { content: '⏹️ Response generation stopped', isBot: true, error: true }
    ]);
    setAbortController(new AbortController());
  };

  const toggleDarkMode = () => setIsDarkMode(dm => !dm);
  const handleLogout = () => {
    if (!isLogout) {
      logout();
      navigate('/');
    }
  };
  const handleVoiceInput = () => {
    if (isRecording) recognition.current.stop();
    else recognition.current.start();
    setIsRecording(rec => !rec);
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      synthesis.current.cancel();
      return setIsSpeaking(false);
    }
    if (!utterance.current) return console.error('No TTS available');
    utterance.current.text = text;
    synthesis.current.speak(utterance.current);
    setIsSpeaking(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    synthesis.current.cancel();
    const controller = new AbortController();
    setAbortController(controller);

    setMessages(prev => [...prev, { content: input, isBot: false }]);

    try {
      const { data } = await axios.post(
        'http://localhost:3000/api/ml/llm',
        { prompt: input, language: selectedLanguage },
        { signal: controller.signal }
      );

      setMessages(prev => [
        ...prev,
        {
          content: data.response.replace(/<think>.*?<\/think>/gs, ''),
          isBot: true,
          model: data.model.id,
          candidates: data.candidates,
          responseTime: data.responseTime
        }
      ]);
      setInput('');
    } catch (err) {
      if (!axios.isCancel(err)) {
        setMessages(prev => [
          ...prev,
          { content: '⚠️ Failed to get response.', isBot: true, error: true }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (selectedLanguage) {
      case 'te': return 'ఏదైనా ప్రశ్న అడగండి...';
      case 'hi': return 'कोई प्रश्न पूछें...';
      case 'ta': return 'எந்த கேள்வியையும் கேளுங்கள்...';
      case 'ur': return 'کوئی سوال پوچھیں...';
      case 'ar': return 'اطرح أي سؤال...';
      default:   return 'Ask your question...';
    }
  };

  return (
    <div className={`vh-100 d-flex flex-column ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <div className="d-flex gap-2 align-items-center">
          <select
            className={`form-select form-select-sm ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
          >
            {Object.values(LANGUAGES).map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.name})
              </option>
            ))}
          </select>

          {isLoading && (
            <button className="btn btn-danger btn-sm" onClick={handleStop}>
              <i className="fas fa-stop-circle me-2"></i> Stop
            </button>
          )}

          <button 
            className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </button>
        </div>

        <button 
          className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
          onClick={toggleDarkMode}
        >
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow-1 overflow-auto p-3">
        {messages.map((msg, i) => (
          <div key={i} className={`d-flex ${msg.isBot ? '' : 'justify-content-end'} mb-3`}>
            <div
              className={`rounded p-3 position-relative shadow-sm ${
                msg.isBot 
                  ? (isDarkMode ? 'bg-secondary' : 'bg-white') 
                  : 'bg-primary text-white'
              }`}
              style={{ maxWidth: '85%' }}
            >
              {msg.isBot && (
                <>
                  <button
                    className="btn btn-link text-decoration-none p-0"
                    onClick={() => toggleSpeech(msg.content)}
                    style={{ position: 'absolute', bottom: '8px', right: '8px' }}
                  >
                    <i className={`fas ${isSpeaking ? 'fa-volume-mute' : 'fa-volume-up'} ${isDarkMode ? 'text-light' : 'text-dark'}`}></i>
                  </button>

                  <div className="d-flex flex-wrap align-items-center mb-2 gap-2">
                    <div className="d-flex align-items-center">
                      <i className={`fas fa-microphone ${isDarkMode ? 'text-light' : 'text-muted'} me-2`}></i>
                      <small className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>
                        {formatModelName(msg.model)} • <span className="text-success">{msg.responseTime}ms</span>
                      </small>
                    </div>

                    <div className="d-flex gap-1 flex-wrap">
                      {msg.candidates?.map((c, idx) => (
                        <span
                          key={idx}
                          className={`badge rounded-pill ${
                            c === msg.model
                              ? 'bg-success'
                              : (isDarkMode ? 'bg-light text-dark' : 'bg-secondary')
                          } py-1 px-2`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {c?.split('/')?.[1]?.split('-')?.[0] || 'unknown'}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={`border-top p-3 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="input-group">
          <button
            type="button"
            className={`btn ${isRecording ? 'btn-danger' : (isDarkMode ? 'btn-dark' : 'btn-outline-secondary')}`}
            onClick={handleVoiceInput}
          >
            <i className={`fas ${isRecording ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
          </button>

          <input
            type="text"
            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLoading}
          />

          <button
            className={`btn ${isLoading ? 'btn-danger' : 'btn-primary'}`}
            type={isLoading ? 'button' : 'submit'}
            onClick={isLoading ? handleStop : undefined}
            disabled={!input.trim() && !isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Loading...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i> Send
              </>
            )}
          </button>
        </div>
        <small className={`mt-2 d-block ${isDarkMode ? 'text-light' : 'text-muted'}`}>
          {selectedLanguage === 'ar' ? 'اضغط إدخال للإرسال • انقر على أيقونة السماعة لسماع الردود' : 
          'Press Enter to send • Click speaker icon to hear responses'}
        </small>
      </form>
    </div>
  );
};

export default ChooseBot;