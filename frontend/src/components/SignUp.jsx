import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../store/UseAuth";
import toast from "react-hot-toast";
import BotWelcomePanel from "./BotWelcomePanel";

const SignUp = () => {
  const { Signup, isSignUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const validate = () => {
    const errors = [];
    if (!formData.fullName) errors.push("fullName");
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.push("email");
    if (!formData.password || passwordStrength < 3) errors.push("password");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();

    if (errors.length > 0) {
      errors.forEach((field) => {
        toast.error(
          `Please check your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
      });
      return;
    }

    try {
      await Signup(formData);
      toast.success("Account created successfully!");
      navigate("/chat");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  const strengthColors = ["#dc3545", "#ffc107", "#17a2b8", "#28a745"];
  const strengthLabels = ["Weak", "Moderate", "Good", "Strong"];

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column bg-dark">
      <div className="row justify-content-center align-items-center flex-grow-1">
        <div className="col-12 col-lg-10 col-xxl-8">
          <div className="row g-0 shadow-lg rounded-3 overflow-hidden glassmorphism-effect">
            <BotWelcomePanel />

            <div className="col-12 col-md-6 bg-dark-2 p-4 p-lg-5">
              <div className="w-100" style={{ maxWidth: "400px" }}>
                <div className="card border-0 bg-transparent">
                  <div className="card-body p-3 p-lg-4">
                    <div className="text-center mb-4">
                      <i className="fas fa-robot fa-3x text-primary mb-3 animate-float"></i>
                      <h2 className="h4 text-light mb-1">Create AI Account</h2>
                      <p className="text-muted">Join the neural network</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Full Name Input */}
                      <div className="mb-3">
                        <div className="input-group input-group-neon">
                          <span className="input-group-text bg-primary text-white border-primary">
                            <i className="fas fa-user"></i>
                          </span>
                          <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-control bg-white text-dark ${
                              touched.fullName && !formData.fullName ? "is-invalid" : ""
                            }`}
                            placeholder="Full Name"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="mb-3">
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
                            placeholder="Email Address"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
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
                              touched.password && passwordStrength < 3 ? "is-invalid" : ""
                            }`}
                            placeholder="Password"
                          />
                        </div>
                        <div className="password-strength mt-2">
                          <div className="d-flex gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className="flex-grow-1"
                                style={{
                                  height: "4px",
                                  backgroundColor: i < passwordStrength
                                    ? strengthColors[passwordStrength - 1]
                                    : "rgba(255,255,255,0.1)",
                                  transition: "background-color 0.3s ease"
                                }}
                              />
                            ))}
                          </div>
                          <small className={`d-block text-end mt-1 fw-medium text-dark`}>
                            {formData.password
                              ? strengthLabels[passwordStrength - 1]
                              : "Security Level"}
                          </small>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-bold hover-glow"
                        disabled={isSignUp}
                      >
                        {isSignUp ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-2"></i>
                            Sign Up
                          </>
                        )}
                      </button>

                      <p className="text-center mt-4 mb-0 text-muted">
                        Already have an account?{" "}
                        <a href="/login" className="text-primary hover-underline">
                          Login here <i className="fas fa-arrow-right ms-1"></i>
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

export default SignUp;
