import { useState, useRef, useEffect } from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaStop, 
  FaInfoCircle,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaComments,
  FaRupeeSign,
  FaCloudSun,
  FaSeedling,
  FaBook,
  FaHandsHelping,
  FaLightbulb,
  FaLanguage
} from 'react-icons/fa';
import useAuth from "../store/UseAuth";
import { useNavigate } from "react-router-dom";


const FarmBoat = () => {
  const navigate = useNavigate();
  const GEMINI_API_KEY = 'AIzaSyCnZRF-PjtViM_lN6xcM1QUZZatgaK6Jd0';
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('unrequested');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);
  const synthesis = useRef(null);

  const languages = {
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    en: 'English',
    ur: 'Urdu',

  };

  const voiceConfig = {
    en: { lang: 'en-US', rate: 1.0 },
    hi: { lang: 'hi-IN', rate: 0.9 },
    te: { lang: 'te-IN', rate: 0.85 },
    ta: { lang: 'ta-IN', rate: 0.85 },
    ur: { lang: 'ur-PK', rate: 0.8 }
  };

  // Speech Recognition Setup
  const { logout,isLogout } = useAuth();
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

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.current.onend = () => setIsRecording(false);
    }
  }, []);
  {
    if(isLogout){
      navigate('/')
    }
  }

  // Speech Synthesis Setup
  useEffect(() => {
    synthesis.current = window.speechSynthesis;
    
    const handleVoicesChanged = () => {
      const availableVoices = synthesis.current.getVoices();
      setVoices(availableVoices);
      const config = voiceConfig[selectedLanguage];
      const voice = availableVoices.find(v => v.lang === config.lang) ||
                    availableVoices.find(v => v.lang.startsWith(selectedLanguage)) ||
                    availableVoices.find(v => v.lang.startsWith('en'));
      setSelectedVoice(voice);
    };

    synthesis.current.addEventListener('voiceschanged', handleVoicesChanged);
    return () => synthesis.current?.removeEventListener('voiceschanged', handleVoicesChanged);
  }, [selectedLanguage]);

  // Language Handling
  useEffect(() => {
    if (recognition.current) {
      recognition.current.lang = voiceConfig[selectedLanguage].lang;
    }
  }, [selectedLanguage]);

  // Speech Functions
  const toggleRecording = () => {
    if (!recognition.current) return;
    if (isRecording) {
      recognition.current.stop();
    } else {
      try {
        recognition.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Microphone error:', error);
        setIsRecording(false);
      }
    }
  };

  const speak = (text) => {
    if (!synthesis.current) return;
    if (isSpeaking) {
      synthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*]/g, '');
    const config = voiceConfig[selectedLanguage];
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = selectedVoice;
    utterance.lang = config.lang;
    utterance.rate = config.rate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesis.current.speak(utterance);
  };

  // Location Handling
  const getLocation = () => {
    setLocationStatus('requesting');
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('granted');
      },
      (error) => {
        setLocationStatus('denied');
        console.error('Location error:', error);
      },
      { timeout: 10000 }
    );
  };

  // Stop Chat Functionality
  const stopChat = () => {
    setMessages([]);
    setLocation(null);
    setLocationStatus('unrequested');
    if (synthesis.current) {
      synthesis.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Add actual logout logic here
    console.log('User logged out');
    stopChat();
  };

  // UI Styling
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

    .main-container {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      min-height: 100vh;
      padding: 2rem;
      font-family: 'Poppins', sans-serif;
    }

    .info-panel {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      padding: 2rem;
      height: calc(100vh - 4rem);
      overflow-y: auto;
    }

    .chat-container {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      height: calc(100vh - 4rem);
      display: flex;
      flex-direction: column;
    }

    .chat-header {
      background: linear-gradient(135deg, #2e7d32 0%, #388e3c 100%);
      padding: 1.5rem 2rem;
      border-radius: 1.5rem 1.5rem 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
    }

    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .control-button {
      background: rgba(255,255,255,0.15);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .control-button:hover {
      background: rgba(255,255,255,0.25);
    }

    .control-button.danger {
      background: #dc3545;
    }

    .control-button.danger:hover {
      background: #bb2d3b;
    }

    .chat-body {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      background: #f8fafc;
    }

    .message-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .user-message {
      align-self: flex-end;
      background: #1976d2;
      color: white;
      border-radius: 1.2rem 1.2rem 0 1.2rem;
      max-width: 85%;
      padding: 1.2rem;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
      font-size: 0.95rem;
    }

    .bot-message {
      align-self: flex-start;
      background: white;
      border-radius: 1.2rem 1.2rem 1.2rem 0;
      max-width: 85%;
      padding: 1.2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: relative;
      font-size: 0.95rem;
    }

    .price-response {
      border-left: 4px solid #2e7d32;
      background: #f0fff4;
      padding: 1rem;
      border-radius: 0.8rem;
      margin: 0.5rem 0;
    }

    .audio-controls {
      position: absolute;
      right: 10px;
      bottom: 10px;
      display: flex;
      gap: 8px;
    }

    .mic-button {
      background: ${isRecording ? '#dc3545' : '#2e7d32'};
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .speak-button {
      background: none;
      border: none;
      color: #2e7d32;
      cursor: pointer;
      padding: 5px;
      transition: all 0.3s ease;
    }

    .language-select {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.8rem;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .loading-dots {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      justify-content: center;
    }

    .loading-dot {
      width: 10px;
      height: 10px;
      background: #2e7d32;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .location-status {
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-radius: 0.8rem;
      margin-bottom: 1rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
      font-size: 0.9rem;
    }

    .input-container {
      padding: 1.5rem;
      border-top: 1px solid #eee;
    }

    .audio-input {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .form-control {
      flex: 1;
      padding: 0.9rem;
      border: 1px solid #ddd;
      border-radius: 0.8rem;
      outline: none;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      border-color: #2e7d32;
      box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
    }

    .btn {
      padding: 0.9rem 1.75rem;
      border: none;
      border-radius: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-success {
      background: #2e7d32;
      color: white;
    }

    .btn-success:hover {
      background: #1b5e20;
    }

    .feature-card {
      background: #f8fafc;
      border-radius: 1rem;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;
      border: 1px solid rgba(46,125,50,0.1);
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.08);
    }

    .feature-icon {
      font-size: 1.85rem;
      color: #2e7d32;
      margin-bottom: 1rem;
    }

    .info-title {
      font-size: 1.6rem;
      color: #2e7d32;
      margin-bottom: 1.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 600;
    }

    .feature-list {
      list-style: none;
      padding-left: 0;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      font-size: 0.95rem;
    }

    .feature-item-icon {
      color: #2e7d32;
      font-size: 1.3rem;
      min-width: 30px;
    }

    @media (max-width: 768px) {
      .main-container {
        padding: 1rem;
      }
      
      .chat-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
      }

      .header-controls {
        width: 100%;
        justify-content: space-between;
      }

      .control-button {
        padding: 0.5rem;
        font-size: 0.8rem;
      }

      .language-select {
        width: 100%;
      }
    }
  `;

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, [styles]);

  const formatResponse = (text, isPrice) => {
    const cleanText = text.replace(/[*]/g, '');
    const content = isPrice ? (
      <div className="price-response">
        {cleanText.split('\n').map((line, index) => (
          <div key={index} className="response-item">
            🌱 {line.replace(/^\d+\.\s*/, '')}
          </div>
        ))}
      </div>
    ) : (
      cleanText.split('\n').map((line, index) => (
        <div key={index} className="response-item">
          {line}
        </div>
      ))
    );

    return (
      <>
    
        {content}
        <div className="audio-controls">
          <button 
            className="speak-button"
            onClick={() => speak(cleanText)}
            disabled={!synthesis.current}
            title={synthesis.current ? "Read aloud" : "Text-to-speech unavailable"}
          >
            {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        </div>
      </>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInputMessage('');
    setLoading(true);

    try {
      if (/(location|where am i|मेरा स्थान|నా స్థానం|என் இடம்)/i.test(userMessage)) {
        let responseText = '';
        switch(locationStatus) {
          case 'granted':
            responseText = 'Using your location for accurate prices 🌍';
            break;
          case 'denied':
            responseText = 'Location access denied. Showing general prices 🔒';
            break;
          case 'unsupported':
            responseText = 'Browser doesn';
            break;
          default:
            responseText = 'Location not requested yet 📊';
        }
        
        setMessages(prev => [...prev, { 
          text: responseText, 
          isBot: true,
          isPrice: false
        }]);
        return;
      }

      const isPriceQuery = /(price|rate|मूल्य|दर|விலை|ధర|قیمت)/i.test(userMessage);
      let locationContext = '';
      let usedLocation = false;

      if (isPriceQuery) {
        if (!location && locationStatus !== 'denied') {
          getLocation();
          setMessages(prev => [...prev, { 
            text: '📍 Enable location for local prices', 
            isBot: true 
          }]);
          return;
        }

        if (location) {
          locationContext = `User Location: ${location.lat},${location.lng}. `;
          usedLocation = true;
        } else {
          locationContext = 'National average prices. ';
        }
      }

      const currentDate = new Date().toLocaleDateString('en-IN');
      const prompt = isPriceQuery 
        ? `${locationContext}Provide ${languages[selectedLanguage]} prices for: "${userMessage}".
           Date: ${currentDate}
           Current ₹/kg price
           - Price trend
           - Nearest market rates
           - MSP comparison
           - Key factors
           -government schemes
           (Keep response within 10 concise points)` 
        : `As agricultural expert (${languages[selectedLanguage]}), answer: "${userMessage}"in maximum 18 lines.
             Include:
           - Practical steps
           - Local materials
           - Cost range
           - Best timing
           - Safety tips`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ 
                text: prompt + (location ? `\nCoordinates: ${location.lat},${location.lng}` : "")
              }]
            }]
          })
        }
      );

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'Could not understand the question.';

      setMessages(prev => [...prev, { 
        text: responseText, 
        isBot: true,
        isPrice: isPriceQuery,
        usedLocation 
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { text: `Error: ${error.message}`, isBot: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="container-fluid">
        <div className="row g-4">
          {/* Information Panel */}
          <div className="col-12 col-md-5 col-lg-4">
            <div className="info-panel">
              <h2 className="info-title">
                <FaInfoCircle />
                Kisan Saathi Guide
              </h2>
              
              <div className="feature-card">
                <h4 className="text-success mb-3">
                  <FaHandsHelping className="feature-icon" />
                  How It Works
                </h4>
                <ul className="feature-list">
                  <li className="feature-item">
                    <FaComments className="feature-item-icon" />
                    Voice or text input
                  </li>
                  <li className="feature-item">
                    <FaMapMarkerAlt className="feature-item-icon" />
                    Location-based pricing
                  </li>
                  <li className="feature-item">
                    <FaLanguage className="feature-item-icon" />
                    Multi-language support
                  </li>
                  <li className="feature-item">
                    <FaSeedling className="feature-item-icon" />
                    AI-powered insights
                  </li>
                </ul>
              </div>

              <div className="feature-card">
                <h4 className="text-success mb-3">
                  <FaLightbulb className="feature-icon" />
                  Key Features
                </h4>
                <ul className="feature-list">
                  <li className="feature-item">
                    <FaRupeeSign className="feature-item-icon" />
                    Real-time market prices
                  </li>
                  <li className="feature-item">
                    <FaCloudSun className="feature-item-icon" />
                    Weather insights
                  </li>
                  <li className="feature-item">
                    <FaSeedling className="feature-item-icon" />
                    Crop advice
                  </li>
                  <li className="feature-item">
                    <FaBook className="feature-item-icon" />
                    Agricultural knowledge base
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="col-12 col-md-7 col-lg-8">
            <div className="chat-container">
              <div className="chat-header">
                <h2><FaSeedling className="me-2" />Kisan Saathi</h2>
                <div className="header-controls">
                  <select
                    className="language-select text-dark"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  <button className="control-button danger" onClick={stopChat}>
                    <FaStop /> Stop
                  </button>
                  <button className="control-button" onClick={logout}>
                    <FaSignOutAlt /> Logout
                  </button>
                  <button 
                onClick={() => navigate('/')}
                className="btn btn-light btn-sm"
              >
                <i className="fas fa-home me-2"></i>
                Home
              </button>
                </div>
              </div>

              <div className="chat-body">
                <div className="message-container">
                  {messages.map((message, index) => (
                    <div key={index} className={message.isBot ? 'bot-message' : 'user-message'}>
                      {formatResponse(message.text, message.isPrice)}
                    </div>
                  ))}
                  {loading && (
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
                      <div className="loading-dot" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="input-container">
                <div className="location-status">
                  {locationStatus === 'granted' ? (
                    <>
                      <span>📍 Location Enabled</span>
                      <button 
                        className="btn btn-link btn-sm"
                        onClick={() => setLocation(null)}
                      >
                        (Clear)
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={getLocation}
                    >
                      {locationStatus === 'denied' ? 'Retry Location' : 'Enable Location'}
                    </button>
                  )}
                </div>

                <div className="audio-input">
                  <button
                    className="mic-button"
                    onClick={toggleRecording}
                    disabled={!recognition.current}
                  >
                    {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  </button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Speak or type..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    className="btn btn-success"
                    onClick={handleSend}
                    disabled={loading}
                  >
                    Send
                  </button>
                </div>
                <div className="text-center mt-2 text-muted small">
                  Try: "Tomato prices near me" or "Best crops for my region"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmBoat;