import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TrainerCoupon.css";

const TrainerCoupon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = "" } = location.state || {};

  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const updateUserRole = async (role) => {
    try {
      await fetch(
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/role/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        }
      );
    } catch (e) {}
  };

  // ── Validate coupon (mirrors Flutter's _assignCouponCode) ────
  const handleValidate = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/coupons/assign",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, couponCode: couponCode.trim() }),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (response.ok) {
        await updateUserRole("trainer");
        setSuccessMsg("Coupon assigned successfully! Setting up your profile…");
        setTimeout(() => {
          navigate("/onboarding", { state: { email, role: "trainer" } });
        }, 1500);
      } else {
        setError("Invalid Coupon Code. Please try again.");
      }
    } catch (err) {
      setError("Request failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Continue as Athlete instead ──────────────────────────────
  const handleContinueAsAthlete = async () => {
    setLoading(true);
    await updateUserRole("athlete");
    navigate("/onboarding", { state: { email, role: "athlete" } });
  };

  return (
    <div className="coupon-page">
      <div className="coupon-blob coupon-blob-tr" />

      <div className="coupon-card">
        <button className="coupon-back" onClick={() => navigate("/choice", { state: { email } })}>
          ← Back
        </button>

        <div className="coupon-icon">🎟️</div>
        <h1 className="coupon-title">Enter Coupon Code</h1>
        <p className="coupon-subtitle">
          Enter your trainer subscription coupon to unlock trainer features.
        </p>

        {/* Coupon input */}
        <div className="coupon-input-wrap">
          <input
            type="text"
            className={`coupon-input ${error ? "coupon-input-error" : ""}`}
            placeholder="Type your Coupon Code"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value); setError(""); }}
          />
          {error && <p className="coupon-error">{error}</p>}
        </div>

        {successMsg && (
          <div className="coupon-success">✅ {successMsg}</div>
        )}

        {/* Buttons — mirrors Flutter's two ElevatedButtons */}
        <div className="coupon-actions">
          <button
            className="coupon-btn-outline"
            onClick={handleContinueAsAthlete}
            disabled={loading}
          >
            Continue as Athlete
          </button>
          <button
            className="coupon-btn-primary"
            onClick={handleValidate}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Validate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerCoupon;