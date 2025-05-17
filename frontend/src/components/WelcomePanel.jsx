import React from 'react';

const WelcomePanel = () => (
  <div className="col-12 col-md-6 d-flex bg-success bg-gradient text-white align-items-center justify-content-center p-4">
    <div className="text-center w-100">
      <div className="position-relative d-inline-block mb-3" style={{ width: 100, height: 100 }}>
        <i className="fas fa-tractor fa-4x"></i>
        <i className="fas fa-seedling fa-2x text-warning position-absolute top-0 start-0"></i>
        <i className="fas fa-sun fa-2x text-warning position-absolute top-0 end-0"></i>
        <i className="fas fa-leaf fa-2x position-absolute bottom-0 end-0"></i>
      </div>
      <h1 className="h3 fw-bold mb-2">Welcome to Kisan Saathi</h1>
      <p className="lead mb-4">Your smart farming companion</p>
      <div className="d-flex justify-content-center gap-3">
        <i className="fas fa-comments fa-2x"></i>
        <i className="fas fa-robot fa-2x"></i>
        <i className="fas fa-chart-line fa-2x"></i>
      </div>
    </div>
  </div>
);

export default WelcomePanel;
