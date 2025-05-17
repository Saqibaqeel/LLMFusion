import React from 'react';
import { useNavigate } from 'react-router-dom';

// Add Font Awesome CDN in your public/index.html head section:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

const ChatbotCard = ({ type, description, example, path }) => {
  const navigate = useNavigate();
  
  const getColorClass = (type) => {
    switch (type.toLowerCase()) {
      case 'legal':
        return 'bg-primary text-white';
      case 'farming':
        return 'bg-success text-white';
      case 'education':
        return 'bg-info text-dark';
      case 'medical':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'legal':
        return 'fa-scale-balanced';
      case 'farming':
        return 'fa-tractor';
      case 'education':
        return 'fa-graduation-cap';
      case 'medical':
        return 'fa-stethoscope';
      default:
        return 'fa-robot';
    }
  };

  return (
    <div 
      onClick={() => navigate(path)}
      className={`card ${getColorClass(type)} mb-4 hover-shadow cursor-pointer transition-all`}
      style={{ minHeight: '250px' }}
      role="button"
      tabIndex={0}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          <i className={`fas ${getIcon(type)} fa-2x me-3`}></i>
          <h3 className="card-title mb-0">{type} Chatbot</h3>
        </div>
        <p className="card-text flex-grow-1">{description}</p>
        <div className="mt-3 bg-white text-dark p-3 rounded">
          <blockquote className="blockquote mb-0">
            <p className="font-italic text-muted small mb-0">
              <i className="fa fa-comment-dots me-2"></i>
              {example}
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

const ListofBoat = () => {
  const chatbots = [
    {
      type: 'Legal',
      path: '/legal-chat',
      description: 'Assists with legal inquiries, contract reviews, and provides basic legal guidance.',
      example: 'Can you review this rental agreement for potential red flags?'
    },
    {
      type: 'Farming',
      path: '/farming-chat',
      description: 'Provides agricultural advice, crop management tips, and market price updates.',
      example: 'Whats the best time to harvest wheat in current weather conditions?'
    },
    {
      type: 'Education',
      path: '/education-chat',
      description: 'Helps with learning resources, course recommendations, and study plans.',
      example: 'Suggest a 3-month Python programming learning path for beginners'
    },
    {
      type: 'Medical',
      path: '/medical-chat',
      description: 'Offers general health information and medication reminders (not a substitute for professional medical advice).',
      example: 'What are the common symptoms of vitamin D deficiency?'
    },
  ];

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 display-4">
        <i className="fa fa-comments me-3"></i>
        Explore Chatbot Categories
      </h2>
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {chatbots.map((bot, index) => (
          <div className="col" key={index}>
            <ChatbotCard
              type={bot.type}
              description={bot.description}
              example={bot.example}
              path={bot.path}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListofBoat;