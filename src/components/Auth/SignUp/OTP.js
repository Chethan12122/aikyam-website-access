import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OTP.css";

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive name, email, password passed from SignUp via navigate state
  const { name = "", email = "", password = "" } = location.state || {};

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [timerDuration, setTimerDuration] = useState(180); // 3 min like Flutter
  const [canResend, setCanResend] = useState(true);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // ── Send OTP on mount (mirrors Flutter's BlocProvider → SendOtpEvent) ──
  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }
    sendOtp();
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Timer (mirrors Flutter's startTimer every 5s) ───────────
  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimerDuration(180);
    setOtpExpired(false);
    timerRef.current = setInterval(() => {
      setTimerDuration((prev) => {
        if (prev <= 5) {
          clearInterval(timerRef.current);
          setOtpExpired(true);
          return 0;
        }
        return prev - 5;
      });
    }, 5000);
  };

  // ── Send OTP API call ────────────────────────────────────────
  const sendOtp = async () => {
    setError("");
    setLoading(true);
    let retryCount = 0;

    while (retryCount < 3) {
      try {
        const response = await fetch(
          "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/sendOtp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
            signal: AbortSignal.timeout(10000),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setOtpSent(true);
          startTimer();
          setLoading(false);
          return;
        } else if (response.status === 400) {
          setError("OTP expired. Please resend.");
          setLoading(false);
          return;
        } else {
          setError(data.message || "Failed to send OTP.");
        }
      } catch (err) {
        if (retryCount === 2) {
          setError("Max retries reached. Please try again later.");
        }
      }
      retryCount++;
      if (retryCount < 3) await delay(2000);
    }
    setLoading(false);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // ── Verify OTP ───────────────────────────────────────────────
  const verifyOtp = async (otpValue) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/verifyOtp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, userOtp: otpValue }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();

      if (response.ok && data.verified) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        setSuccessMsg("Sign-up Successful! You have successfully registered!");
        clearInterval(timerRef.current);
        setTimeout(() => navigate("/choice", { state: { email } }), 1800);
      } else if (response.status === 400) {
        setError("OTP expired. Please resend.");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Request timed out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Box input handling (mirrors Flutter's _onOtpEntered) ─
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last digit
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    verifyOtp(otpValue);
  };

  // ── Resend OTP ───────────────────────────────────────────────
  const handleResend = () => {
    if (!canResend || loading) return;
    setCanResend(false);
    setOtp(Array(6).fill(""));
    setError("");
    setSuccessMsg("");
    sendOtp();
    // Allow resend after 30s (mirrors Flutter's Future.delayed 30s)
    setTimeout(() => setCanResend(true), 30000);
  };

  return (
    <div className="otp-page">
      <div className="otp-card">

        {/* Back button */}
        <button className="otp-back" onClick={() => navigate("/signup")}>
          ← Back
        </button>

        {/* Icon */}
        <div className="otp-icon">✉️</div>

        <h1 className="otp-title">Check your Email</h1>
        <p className="otp-subtitle">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        {/* Success */}
        {successMsg && (
          <div className="otp-success">✅ {successMsg}</div>
        )}

        {/* Loading — sending OTP */}
        {loading && !otpSent && (
          <div className="otp-sending">
            <span className="spinner-dark" /> Sending OTP…
          </div>
        )}

        {/* OTP boxes */}
        {(otpSent || error) && !successMsg && (
          <form onSubmit={handleSubmit} className="otp-form">
            <div className="otp-boxes">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`otp-box ${error ? "otp-box-error" : ""} ${digit ? "otp-box-filled" : ""}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            {error && (
              <p className={`otp-error-text ${error.toLowerCase().includes("expired") || error.toLowerCase().includes("invalid") ? "otp-error-primary" : ""}`}>
                {error}
              </p>
            )}

            <button type="submit" className="otp-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Submit"}
            </button>
          </form>
        )}

        {/* Resend */}
        <button
          className={`otp-resend ${!canResend || loading ? "otp-resend-disabled" : ""}`}
          onClick={handleResend}
          disabled={!canResend || loading}
        >
          Resend OTP
        </button>

        {/* Timer */}
        {timerDuration > 0 && !otpExpired && (
          <p className="otp-timer">OTP expires in: {timerDuration} seconds</p>
        )}
        {otpExpired && (
          <p className="otp-expired">OTP Expired. Please resend.</p>
        )}

      </div>
    </div>
  );
};

export default OTP;