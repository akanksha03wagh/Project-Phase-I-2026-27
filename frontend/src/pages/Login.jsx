import React, { useState } from "react";
import API from "../services/api";

import { Link, useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import "../styles/Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setSuccessMessage("");
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Run frontend validation first
  const isValid = validateForm();

  if (!isValid) {
    return;
  }

  try {
    console.log("Sending login request...");

    const response = await API.post("/auth/login", {
      email: formData.email.trim(),
      password: formData.password,
    });

    console.log("Backend login response:", response.data);

    // Store JWT token
    localStorage.setItem("token", response.data.token);

    // Store user information
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    // Show success message
    setErrors({});
setSuccessMessage("Login successful!");

console.log("Logged-in user:", response.data.user);

setTimeout(() => {
  navigate("/dashboard");
}, 800);
  } catch (error) {
    console.error("Login error:", error);

    // Remove any old success message
    setSuccessMessage("");

    // Show backend error
    setErrors({
      email:
        error.response?.data?.message ||
        "Login failed. Please try again.",
    });
  }
};
  return (
    <div className="auth-page">

      {/* Header */}
      <header className="auth-header">

        {/* Brand */}
        <Link to="/" className="auth-brand">

          <div className="auth-brand-icon">
            <FaRobot />
          </div>

          <div>
            <strong>TestGen AI</strong>
            <span>AI Test Case Generator</span>
          </div>

        </Link>

        {/* Back to Home */}
        <Link to="/" className="back-home">
          <FaArrowLeft />
          Back to Home
        </Link>

      </header>

      {/* Main Container */}
      <div className="auth-container">

        {/* Left Visual Section */}
        <div className="auth-visual">

          <div className="visual-content">

            {/* Illustration */}
            <div className="auth-illustration">
              <FaRobot />
            </div>

            <h1>Welcome Back!</h1>

            <p>
              Sign in to continue generating intelligent
              software test cases with AI.
            </p>

            {/* Feature 1 */}
            <div className="mini-feature">

              <span>
                <FaCheck />
              </span>

              <p>AI-powered test case generation</p>

            </div>

            {/* Feature 2 */}
            <div className="mini-feature">

              <span>
                <FaCheck />
              </span>

              <p>Requirement traceability</p>

            </div>

            {/* Feature 3 */}
            <div className="mini-feature">

              <span>
                <FaCheck />
              </span>

              <p>Automated test coverage analysis</p>

            </div>

          </div>

        </div>

        {/* Right Login Card */}
        <div className="auth-card">

          {/* Heading */}
          <div className="auth-heading">

            <h2>Login to TestGen AI</h2>

            <p>
              Enter your credentials to access your account.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div
                className={`input-wrapper ${
                  errors.email ? "login-input-error" : ""
                }`}
              >

                <FaEnvelope />

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

              {errors.email && (
                <div className="login-error-text">
                  <FaTimes />
                  {errors.email}
                </div>
              )}

            </div>

            {/* Password */}
            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div
                className={`input-wrapper ${
                  errors.password ? "login-input-error" : ""
                }`}
              >

                <FaLock />

                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}

                </button>

              </div>

              {errors.password && (
                <div className="login-error-text">
                  <FaTimes />
                  {errors.password}
                </div>
              )}

            </div>

            {/* Remember Me + Forgot Password */}
            <div className="form-options">

              <label className="remember">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />

                <span>Remember Me</span>

              </label>

              <a
                href="#forgot-password"
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>

            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="success-message">
                <FaCheck />
                {successMessage}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="auth-button"
            >
              Login
            </button>

          </form>

          {/* Register */}
          <p className="auth-switch">

            Don't have an account?{" "}

            <Link to="/register">
              Register Now
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}; 

export default Login;