import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ChoiceScreen.css";

const ChoiceScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = "" } = location.state || {};

  const updateUserRole = async (role) => {
    try {
      await fetch(
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/role",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        }
      );
    } catch (e) {
      // keep UI working even if role update fails
    }
  };

  const handleAthlete = async () => {
    await updateUserRole("athlete");
    navigate("/onboarding", { state: { email, role: "athlete" } });
  };

  const handleTrainer = () => {
    // Trainer goes to coupon screen first
    navigate("/trainer-coupon", { state: { email } });
  };



  
  return (
    <div className="choice-page">
      {/* Decorative blobs */}
      <div className="choice-blob choice-blob-tr" />
      <div className="choice-blob choice-blob-bl" />

      <div className="choice-content">
        <h1 className="choice-title">Select Your Best Suitable Choice</h1>
        <p className="choice-subtitle">Choose your role to get started</p>

        <div className="choice-cards">
          {/* Athlete Card */}
          <div className="choice-card athlete-card" onClick={handleAthlete}>
            <div className="choice-card-icon">🏃</div>
            <h2 className="choice-card-title athlete-title">Athlete</h2>
            <ul className="choice-card-list">
              <li>Manage your Sports Routines</li>
              <li>Join Top listed Trainers</li>
              <li>Personalized content</li>
              <li>And many more</li>
            </ul>
            <button className="choice-card-btn athlete-btn">
              Choose Athlete
            </button>
          </div>

          {/* Trainer Card */}
          <div className="choice-card trainer-card" onClick={handleTrainer}>
            <span className="choice-subscription-badge">Needs Subscription</span>
            <div className="choice-card-icon">🏋️</div>
            <h2 className="choice-card-title trainer-title">Trainer</h2>
            <ul className="choice-card-list">
              <li>Connect Smart Devices</li>
              <li>Create &amp; Manage Teams</li>
              <li>Sports Performance Analysis</li>
              <li>And many more</li>
            </ul>
            <button className="choice-card-btn trainer-btn">
              Choose Trainer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoiceScreen;