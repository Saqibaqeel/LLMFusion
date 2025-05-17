import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../store/UseAuth';
import toast from 'react-hot-toast';


const Home = () => {
  const navigate = useNavigate();
  const {checkAuth,isCheckingAuth,authUser,logout,isLogout}=useAuth()
    const signupPge = () => {
        if(!authUser) {
            toast.error("Please login to access the chat feature.");
        }else{
            navigate('/chat');
        }
    };


  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-4">
            <i className="fas fa-comments me-3"></i>
           LLM-Fusion: mphasizes the fusion of multiple models into one superior answer
          </h1>
          <p className="lead mb-4">
            Experience next-gen conversations powered by multiple AI models
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button 
              className="btn btn-light btn-lg px-4"
              onClick={signupPge}
            >
              <i className="fas fa-rocket me-2"></i>
              Start Chatting
            </button>
            <button className="btn btn-outline-light btn-lg px-4" onClick={() => navigate('/signup')}>
              <i className="fas fa-book me-2"></i>
              Signup
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Why Choose Us?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-effect">
                <div className="card-body text-center p-4">
                  <i className="fas fa-brain fa-3x text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Multi-Model AI</h5>
                  <p className="card-text">
                    Simultaneous analysis using Llama, Gemma, and DeepSeek models
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-effect">
                <div className="card-body text-center p-4">
                  <i className="fas fa-bolt fa-3x text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Lightning Fast</h5>
                  <p className="card-text">
                    Get responses in under 2 seconds with our optimized pipeline
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 hover-effect">
                <div className="card-body text-center p-4">
                  <i className="fas fa-shield-alt fa-3x text-primary mb-3"></i>
                  <h5 className="card-title fw-bold">Secure & Private</h5>
                  <p className="card-text">
                    End-to-end encrypted conversations with no data storage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2 className="fw-bold mb-4">See It in Action</h2>
              <div className="demo-preview shadow-lg rounded-3 overflow-hidden">
                <div className="demo-header bg-dark text-white p-3">
                  <i className="fas fa-comment-dots me-2"></i>
                  Live Demo Preview
                </div>
                <div className="demo-body bg-white p-3">
                  <div className="d-flex mb-3">
                    <div className="bot-message bg-light p-2 rounded-2">
                      <small className="text-muted">AI: How can I help you today?</small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="user-message bg-primary text-white p-2 rounded-2">
                      <small>Tell me about AI technology</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mt-4 mt-md-0">
              <div className="accordion" id="demoAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button 
                      className="accordion-button" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target="#collapseOne"
                    >
                      <i className="fas fa-magic me-2"></i>
                      How It Works
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      <ol className="list-group list-group-numbered">
                        <li className="list-group-item border-0">Type your question</li>
                        <li className="list-group-item border-0">Multiple AI models analyze it</li>
                        <li className="list-group-item border-0">Best response is selected</li>
                        <li className="list-group-item border-0">Instant answer delivered</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-gradient-primary text-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">Join thousands of users experiencing AI-powered conversations</p>
          <button 
            className="btn btn-light btn-lg px-5"
            onClick={() => navigate('/listOchat')}
          >
            <i className="fas fa-comments me-2"></i>
            Start with Specific Bot
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5><i className="fas fa-robot me-2"></i>LLM-Fussion</h5>
              <p className="text-muted">© 2024 All rights reserved</p>
            </div>
            <div className="col-md-6 text-end">
              <div className="d-flex gap-3 justify-content-end">
                <a href="#!" className="text-white"><i className="fab fa-github fa-lg"></i></a>
                <a href="#!" className="text-white"><i className="fab fa-twitter fa-lg"></i></a>
                <a href="#!" className="text-white"><i className="fab fa-discord fa-lg"></i></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Add this CSS in your stylesheet
const styles = `
.hover-effect {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-effect:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
}

.demo-preview {
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.1);
}

.bot-message, .user-message {
  max-width: 70%;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export default Home;