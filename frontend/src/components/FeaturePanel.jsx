import React from 'react';

const FeaturePanel = () => {
  return (
    <div className="d-flex flex-column h-100 bg-light p-4">
      {/* Header Section */}
      <div className="text-center mb-4">
        <h2 className="text-primary fw-bold">
          <i className="fas fa-robot me-2"></i>
          LLM-Fusion
        </h2>
        <p className="text-muted">Optimizing AI responses with cutting-edge technology</p>
      </div>

      {/* How It Works Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-primary">
            <i className="fas fa-cogs me-2"></i>
            How It Works
          </h5>
          <ol className="list-group list-group-numbered">
            <li className="list-group-item border-0 d-flex align-items-start">
              <i className="fas fa-arrow-right text-success me-2"></i>
              <span>Your question is sent to multiple AI models simultaneously</span>
            </li>
            <li className="list-group-item border-0 d-flex align-items-start">
              <i className="fas fa-arrow-right text-success me-2"></i>
              <span>Responses are evaluated by Gemini Flash</span>
            </li>
            <li className="list-group-item border-0 d-flex align-items-start">
              <i className="fas fa-arrow-right text-success me-2"></i>
              <span>Best response is selected in real-time</span>
            </li>
          </ol>
        </div>
      </div>

      {/* AI Models Section */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-primary">
            <i className="fas fa-microchip me-2"></i>
            AI Models Used
          </h5>
          <div className="list-group">
            <div className="list-group-item border-0 d-flex align-items-center">
              <i className="fab fa-meta text-primary me-2"></i>
              <strong>Llama 3</strong> - 70B parameter model
            </div>
            <div className="list-group-item border-0 d-flex align-items-center">
              <i className="fab fa-google text-danger me-2"></i>
              <strong>Gemma</strong> - Google's lightweight model
            </div>
            <div className="list-group-item border-0 d-flex align-items-center">
              <i className="fas fa-brain text-warning me-2"></i>
              <strong>DeepSeek</strong> - Specialized distillation model
            </div>
            <div className="list-group-item border-0 d-flex align-items-center">
              <i className="fas fa-robot text-info me-2"></i>
              <strong>GPT-4</strong> - OpenAI's advanced language model
            </div>
            <div className="list-group-item border-0 d-flex align-items-center">
              <i className="fas fa-shield-alt text-secondary me-2"></i>
              <strong>Claude 2</strong> - Anthropic's safety-focused AI
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto alert alert-info small text-center">
        <i className="fas fa-lightbulb me-2"></i>
        Tip: Selected model shown with <span className="badge bg-success">green badge</span>, others in <span className="badge bg-secondary">gray</span>.
      </div>
    </div>
  );
};

export default FeaturePanel;