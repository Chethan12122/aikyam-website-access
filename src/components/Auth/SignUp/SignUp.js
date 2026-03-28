import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase/firebaseConfig";
import "./SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Please enter your name";
    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password.trim()) {
      newErrors.password = "Please enter your password";
    } else if (password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    return newErrors;
  };

  // ── Email Registration → sends OTP (mirrors Flutter's registration()) ──
  const handleSignUp = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Navigate to OTP screen — pass name, email, password as state
        navigate("/otp", {
          state: {
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
          },
        });
      } else if (data.message === "User already exists") {
        setServerError("User already exists. Please log in.");
      } else {
        setServerError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        setServerError("Request timed out. Please try again.");
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-Up (mirrors Flutter's _handleGoogleSignIn) ───
  const handleGoogleSignUp = async () => {
    setServerError("");
    setGoogleLoading(true);

    try {
      // Sign out first so account picker always shows
      await signOut(auth).catch(() => {});
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Send user data to backend (mirrors Flutter's sendUserDataToApi)
      const response = await fetch(
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/authregister",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName,
            firebase_uid: user.uid,
          }),
        }
      );

      if (response.status === 201) {
        // New user — success
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", user.email);
        navigate("/dashboard");
      } else if (response.status === 409) {
        // User already exists — still log them in
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", user.email);
        setServerError("Account already exists. Logging you in…");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setServerError("Registration failed. Please try again.");
      }
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        setServerError("An account already exists with a different credential.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setServerError("Google sign-in was cancelled.");
      } else if (err.code === "auth/operation-not-allowed") {
        setServerError("Operation not allowed. Please try again later.");
      } else {
        setServerError("Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <div className="signup-page">
      <div className="signup-card">

        {/* Logo */}
        <div className="signup-logo">
          <div className="logo-circle">A</div>
        </div>

        <h1 className="signup-title">Create Your Account</h1>
        <p className="signup-subtitle">Fill the form below to create an account</p>

        {/* Toggle */}
        <div className="signup-toggle">
          <button className="toggle-btn" onClick={() => navigate("/signin")}>
            Log In
          </button>
          <button className="toggle-btn active">Sign Up</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="signup-form" noValidate>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                className={`form-input ${errors.name ? "input-error" : ""}`}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {serverError && (
            <p className={`server-msg ${serverError.includes("Logging") ? "server-info" : "server-error"}`}>
              {serverError}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={isAnyLoading}>
            {loading ? <span className="spinner" /> : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="divider"><span>Or continue with</span></div>

        {/* Google Button */}
        <div className="social-buttons">
          <button
            className="social-btn google-btn"
            onClick={handleGoogleSignUp}
            disabled={isAnyLoading}
          >
            {googleLoading ? (
              <span className="spinner-dark" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.1-4z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.8 33c-2.1 1.4-4.7 2-7.8 2-5.2 0-9.6-3-11.3-7.3l-6.5 5C9.7 39.8 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6 4.9C40.5 35.5 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
                </svg>
                Sign up with Google
              </>
            )}
          </button>
        </div>

        <p className="login-link">
          Already have an account?{" "}
          <button className="link-btn" onClick={() => navigate("/signin")}>
            Log In
          </button>
        </p>

      </div>
    </div>
  );
};

export default SignUp;