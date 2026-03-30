import React from "react";
import { Link } from "react-router-dom";
import "./Welcome.css";

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1>Welcome to Our Platform</h1>
      <p>Please sign in or sign up to continue.</p>
      <div className="welcome-buttons">
        <Link to="/signin" className="welcome-button">Sign In</Link>
        <Link to="/signup" className="welcome-button">Sign Up</Link>
      </div>
    </div>
  );
};

export default Welcome;