import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

import {
  FaRobot,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheck,
  FaTimes
} from "react-icons/fa";

import "../styles/Auth.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Remove error when user starts correcting the field
    setErrors({
      ...errors,
      [name]: ""
    });

    setSuccessMessage("");
  };

  // Password validation
  const passwordRules = {
    minLength: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~+=;']/ .test(formData.password)
  };

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must contain at least 3 characters.";
    }

    // Email validation
    if (!formData.email.trim()) {
  newErrors.email = "Email is required.";
} else if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
) {
  newErrors.email = "Please enter a valid email address.";
}

    // Password validation
    if (!formData.password) {
      newErrors.password = "Please create a password.";
    } else if (!isPasswordValid) {
      newErrors.password = "Password does not meet all requirements.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    // Stop if validation errors exist
    if (Object.keys(newErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    // Send registration data to backend
    try {
      const response = await API.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      console.log("Registration response:", response.data);

      setSuccessMessage(
        "Registration successful! You can now login."
      );

      // Clear form after successful registration
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

    } catch (error) {
      console.error("Registration error:", error);

      setSuccessMessage("");

      setErrors({
        email:
          error.response?.data?.message ||
          "Registration failed. Please try again."
      });
    }
  };

  return (
    <div className="auth-page">

      {/* HEADER */}
      <header className="auth-header">

        <Link to="/" className="auth-brand">

          <div className="auth-brand-icon">
            <FaRobot />
          </div>

          <div>
            <strong>TestGen AI</strong>
            <span>AI-Powered Software Testing</span>
          </div>

        </Link>

        <Link to="/" className="back-home">
          <FaArrowLeft />
          Back to Home
        </Link>

      </header>

      {/* MAIN */}
      <main className="auth-container">

        {/* LEFT SIDE */}
        <section className="auth-visual">

          <div className="visual-content">

            <div className="auth-illustration">
              <FaUser />
            </div>

            <h1>Create Your Account</h1>

            <p>
              Join TestGen AI and simplify the process of
              converting software requirements into test cases.
            </p>

            <div className="mini-feature">
              <span>✓</span>
              Manage your testing projects
            </div>

            <div className="mini-feature">
              <span>✓</span>
              Generate AI-assisted test cases
            </div>

            <div className="mini-feature">
              <span>✓</span>
              Track requirement coverage
            </div>

          </div>

        </section>

        {/* RIGHT SIDE */}
        <section className="auth-card register-card">

          <div className="auth-heading">

            <h2>Create Account</h2>

            <p>
              Register to start using TestGen AI.
            </p>

          </div>

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="success-message">
              <FaCheck />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            <div className="input-group">

              <label>Full Name</label>

              <div
                className={`input-wrapper ${
                  errors.name ? "input-error" : ""
                }`}
              >

                <FaUser />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />

              </div>

              {errors.name && (
                <small className="error-text">
                  {errors.name}
                </small>
              )}

            </div>

            {/* EMAIL */}
            <div className="input-group">

              <label>Email Address</label>

              <div
                className={`input-wrapper ${
                  errors.email ? "input-error" : ""
                }`}
              >

                <FaEnvelope />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />

              </div>

              {errors.email && (
                <small className="error-text">
                  {errors.email}
                </small>
              )}

            </div>

            {/* PASSWORD */}
            <div className="input-group">

              <label>Password</label>

              <div
                className={`input-wrapper ${
                  errors.password ? "input-error" : ""
                }`}
              >

                <FaLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>

              {/* PASSWORD REQUIREMENTS */}
              <div className="password-requirements">

                <p>Password must contain:</p>

                <PasswordRule
                  valid={passwordRules.minLength}
                  text="At least 8 characters"
                />

                <PasswordRule
                  valid={passwordRules.uppercase}
                  text="One uppercase letter"
                />

                <PasswordRule
                  valid={passwordRules.lowercase}
                  text="One lowercase letter"
                />

                <PasswordRule
                  valid={passwordRules.number}
                  text="One number"
                />

                <PasswordRule
                  valid={passwordRules.special}
                  text="One special character"
                />

              </div>

              {errors.password && (
                <small className="error-text">
                  {errors.password}
                </small>
              )}

            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-group">

              <label>Confirm Password</label>

              <div
                className={`input-wrapper ${
                  errors.confirmPassword
                    ? "input-error"
                    : ""
                }`}
              >

                <FaLock />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? <FaEyeSlash />
                    : <FaEye />}
                </button>

              </div>

              {errors.confirmPassword && (
                <small className="error-text">
                  {errors.confirmPassword}
                </small>
              )}

            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="auth-button"
            >
              Create Account
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="auth-switch">

            Already have an account?

            <Link to="/login">
              {" "}Login
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

// PASSWORD RULE COMPONENT
function PasswordRule({ valid, text }) {
  return (
    <div
      className={`password-rule ${
        valid ? "rule-valid" : "rule-invalid"
      }`}
    >
      {valid ? <FaCheck /> : <FaTimes />}
      <span>{text}</span>
    </div>
  );
}

export default Register;