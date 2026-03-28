import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../../../firebase/firebaseConfig";
import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
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

  // ── Email / Password Login (your backend API) ────────────────
  const handleEmailLogin = async (e) => {
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
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          body: JSON.stringify({
            email: email.trim(),
            page: "login",
            password: password.trim(),
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email.trim());
        if (rememberMe) localStorage.setItem("rememberedEmail", email.trim());
        navigate("/dashboard");
      } else {
        setServerError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        setServerError("Request timed out. Please try again.");
      } else if (!navigator.onLine) {
        setServerError("Network error. Please check your internet connection.");
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google Login (Firebase — mirrors Flutter app) ────────────
  const handleGoogleLogin = async () => {
    setServerError("");
    setGoogleLoading(true);

    try {
      // Sign out first so account picker always appears
      // (mirrors Flutter's: await googleSignIn.signOut())
      await signOut(auth).catch(() => {});

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user.email ?? "";

      if (!userEmail) {
        setServerError("Google login failed. Email not found.");
        return;
      }

      // Save login state (mirrors Flutter's DBHelper().setLoginState())
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", userEmail);

      navigate("/dashboard");
    } catch (err) {
      // Mirrors Flutter's FirebaseAuthException error codes
      if (err.code === "auth/account-exists-with-different-credential") {
        setServerError("An account already exists with a different credential.");
      } else if (err.code === "auth/invalid-credential") {
        setServerError("The credential is invalid.");
      } else if (err.code === "auth/operation-not-allowed") {
        setServerError("Operation not allowed. Please try again later.");
      } else if (err.code === "auth/user-disabled") {
        setServerError("This user has been disabled.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setServerError("Google sign-in was cancelled.");
      } else if (!navigator.onLine) {
        setServerError("Network error. Please check your internet connection.");
      } else {
        setServerError("Google login failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <div className="signin-page">
      <div className="signin-card">

        {/* Logo */}
        <div className="signin-logo">
          <div className="logo-circle">A</div>
        </div>

        <h1 className="signin-title">Get Started Now</h1>
        <p className="signin-subtitle">Create an account or log in to explore</p>

        {/* Toggle */}
        <div className="signin-toggle">
          <button className="toggle-btn active">Log In</button>
          <button className="toggle-btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="signin-form" noValidate>

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

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="Enter your password"
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

          <div className="signin-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-link"
              onClick={() => navigate("/forget-password")}
            >
              Forgot Password?
            </button>
          </div>

          {serverError && <p className="server-error">{serverError}</p>}

          <button type="submit" className="btn-primary" disabled={isAnyLoading}>
            {loading ? <span className="spinner" /> : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="divider"><span>Or login with</span></div>

        {/* Google Button */}
        <div className="social-buttons">
          <button
            className="social-btn google-btn"
            onClick={handleGoogleLogin}
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
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <p className="signup-link">
          Don't have an account?{" "}
          <button className="link-btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </p>

      </div>
    </div>
  );
};

export default SignIn;