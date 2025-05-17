import React from 'react';
import { Carousel } from 'react-bootstrap';

const BotWelcomePanel = () => {
  const features = [
    {
      icon: 'fa-brain',
      title: 'Multi-Model AI',
      text: 'Simultaneous processing with Llama, Gemma, and DeepSeek',
      stats: '3 AI Models Working Together'
    },
    {
      icon: 'fa-bolt',
      title: 'Real-Time Analysis',
      text: 'Get responses in under 2 seconds with optimized pipelines',
      stats: 'Response Time < 2000ms'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Smart Selection',
      text: 'AI-powered quality assessment for best results',
      stats: '98% Accuracy Rate'
    }
  ];

  return (
    <div className="col-12 col-md-6 bg-primary text-white p-5 d-flex align-items-center">
      <div className="w-100">
        {/* Animated Header */}
        <div className="text-center mb-5">
          <i className="fas fa-robot fa-4x mb-3 animate-float"></i>
          <h2 className="display-5 fw-bold mb-3">
            Welcome to <span className="text-warning">LLM-Fusion</span> mphasizes the fusion of multiple models into one superior answer
          </h2>
          <p className="lead">Your Intelligent Conversation Partner</p>
        </div>

        {/* Interactive Feature Carousel */}
        <Carousel fade interval={3000} indicators={false} controls={false}>
          {features.map((feature, index) => (
            <Carousel.Item key={index}>
              <div className="text-center px-4">
                <i className={`fas ${feature.icon} fa-3x mb-3 text-warning`}></i>
                <h4 className="mb-3">{feature.title}</h4>
                <p className="mb-2">{feature.text}</p>
                <div className="stats-badge bg-dark text-warning d-inline-block px-3 py-1 rounded-pill">
                  {feature.stats}
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        {/* Interactive Progress Indicators */}
        <div className="row mt-5 g-4">
          <div className="col-4 text-center">
            <div className="progress-circle" data-percent="95">
              <span className="percent">95%</span>
            </div>
            <p className="mt-2 small">Accuracy</p>
          </div>
          <div className="col-4 text-center">
            <div className="progress-circle" data-percent="98">
              <span className="percent">98%</span>
            </div>
            <p className="mt-2 small">Reliability</p>
          </div>
          <div className="col-4 text-center">
            <div className="progress-circle" data-percent="99">
              <span className="percent">99.9%</span>
            </div>
            <p className="mt-2 small">Uptime</p>
          </div>
        </div>

        {/* Animated Scroll Prompt */}
        <div className="text-center mt-5">
          <div className="scroll-prompt animate-bounce">
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these styles to your CSS
const styles = `
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.progress-circle {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  border-radius: 50%;
  background: conic-gradient(
    #ffc107 0% 95%,
    rgba(255,255,255,0.1) 95% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.3s ease;
}

.progress-circle:hover {
  transform: scale(1.1);
}

.percent {
  position: relative;
  z-index: 1;
  font-weight: bold;
}

.stats-badge {
  transition: all 0.3s ease;
}

.stats-badge:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.scroll-prompt {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
`;

export default BotWelcomePanel;