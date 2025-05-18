import React from 'react';

const FeatureForChooseBot = ({ isDarkMode }) => {
  return (
    <div className={`d-flex flex-column h-100 p-3 border rounded shadow-sm ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`}>
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className={`${isDarkMode ? 'text-primary' : 'text-info'} fw-bold mb-2`}>
          <i className="fas fa-microchip me-2"></i>
          Model Selection Engine
        </h3>
        <p className={`small ${isDarkMode ? 'text-light' : 'text-muted'}`}>
          Intelligent model selection through real-time performance analysis
        </p>
      </div>

      {/* Process Steps */}
      <div className="d-flex flex-column flex-md-row justify-content-around mb-4 gap-3">
        {[
          { icon: 'fa-keyboard', text: 'Prompt Analysis', color: 'primary' },
          { icon: 'fa-chart-line', text: 'Benchmark Scoring', color: 'success' },
          { icon: 'fa-cogs', text: 'Context Optimization', color: 'warning' },
          { icon: 'fa-trophy', text: 'Model Selection', color: 'danger' }
        ].map((step, index) => (
          <div 
            key={index}
            className={`text-center p-2 rounded transition-all ${isDarkMode ? 'hover-dark' : 'hover-light'}`}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <i className={`fas ${step.icon} fa-2x text-${step.color} mb-2`}></i>
            <div className={`small ${isDarkMode ? 'text-light' : 'text-dark'}`}>{step.text}</div>
          </div>
        ))}
      </div>

      {/* Model Cards */}
      <div className="mb-4">
        <h6 className={`mb-3 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
          <i className="fas fa-brain me-2"></i>
          Available Models
        </h6>
        
        <div className="row g-3">
          {[
            { 
              icon: 'fab fa-meta', 
              name: 'Llama 3 70B', 
              desc: 'General Purpose LLM',
              specs: '70B Params',
              color: 'primary'
            },
            { 
              icon: 'fab fa-google', 
              name: 'Gemma 7B', 
              desc: 'Research Optimized',
              specs: '7B Parameters',
              color: 'danger'
            },
            { 
              icon: 'fas fa-rocket', 
              name: 'DeepSeek 8B', 
              desc: 'Distilled Efficiency',
              specs: '8B Params',
              color: 'warning'
            }
          ].map((model, index) => (
            <div key={index} className="col-12">
              <div className={`card border-${model.color} ${isDarkMode ? 'bg-dark' : ''}`}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <i className={`${model.icon} fa-lg text-${model.color} me-3`}></i>
                    <div>
                      <h6 className={`mb-1 ${isDarkMode ? 'text-light' : 'text-dark'}`}>{model.name}</h6>
                      <small className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>
                        {model.desc} • <span className="text-muted">{model.specs}</span>
                      </small>
                    </div>
                    <span className={`badge bg-${model.color} ms-auto`}>v2.3</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto text-center small">
        <p className={`mb-0 ${isDarkMode ? 'text-light' : 'text-muted'}`}>
          <i className="fas fa-info-circle me-2"></i>
          Selected model highlighted in chat interface
        </p>
      </div>
    </div>
  );
};

export default FeatureForChooseBot;