import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../store/UseAuth";
import toast from "react-hot-toast";
import BotWelcomePanel from "./BotWelcomePanel";

const Login = () => {
  const { login, isLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const validate = () => {
    const errors = [];
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.push("email");
    if (!formData.password) errors.push("password");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      errors.forEach((field) => {
        toast.error(`Invalid ${field}`);
      });
      return;
    }

    try {
      await login(formData);
      toast.success("login success");
      navigate("/chat");
    } catch (error) {
      toast.error(error.message || "Authentication failure");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column bg-dark">
      <div className="row justify-content-center align-items-center flex-grow-1">
        <div className="col-12 col-lg-10 col-xxl-8">
          <div className="row g-0 shadow-lg rounded-3 overflow-hidden glassmorphism-effect">
            <BotWelcomePanel />

            {/* Login Form */}
            <div className="col-12 col-md-6 bg-dark-2 p-4 p-lg-5">
              <div className="w-100" style={{ maxWidth: "400px" }}>
                <div className="card border-0 bg-transparent">
                  <div className="card-body p-3 p-lg-4">
                    <div className="text-center mb-4">
                      <i className="fas fa-brain-circuit fa-3x text-primary mb-3 animate-float"></i>
                      <h2 className="h4 text-light mb-1">Neural Interface</h2>
                      <p className="text-muted">Access the AI network</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <div className="input-group input-group-neon">
                          <span className="input-group-text bg-primary text-white border-primary">
                            <i className="fas fa-at"></i>
                          </span>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-control bg-white text-dark ${
                              touched.email && !/^\S+@\S+\.\S+$/.test(formData.email)
                                ? "is-invalid"
                                : ""
                            }`}
                            placeholder="email ID"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="input-group input-group-neon">
                          <span className="input-group-text bg-primary text-white border-primary">
                            <i className="fas fa-lock"></i>
                          </span>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-control bg-white text-dark ${
                              touched.password && !formData.password ? "is-invalid" : ""
                            }`}
                            placeholder="password"
                          />
                        </div>
                        <div className="text-end mt-2">
                          <a href="/forgot-password" className="text-primary small hover-underline">
                            <i className="fas fa-unlock me-1"></i>
                            Reset Security Protocol
                          </a>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-bold hover-glow"
                        disabled={isLogin}
                      >
                        {isLogin ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plug me-2"></i>
                            Connect to Network
                          </>
                        )}
                      </button>

                      <div className="mt-4 text-center">
                        <p className="text-muted mb-2">Alternative access methods</p>
                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill px-4 hover-glow"
                          >
                            <i className="fab fa-github me-2"></i>GitHub
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill px-4 hover-glow"
                          >
                            <i className="fab fa-google me-2"></i>Google
                          </button>
                        </div>
                      </div>

                      <p className="text-center mt-4 mb-0 text-muted">
                        New entity?{' '}
                        <a href="/signup" className="text-primary hover-underline">
                          SignUp <i className="fas fa-microchip ms-2"></i>
                        </a>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
