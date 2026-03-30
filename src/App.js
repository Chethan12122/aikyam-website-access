import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./components/Auth/SignIn/SignIn";
import SignUp from "./components/Auth/SignUp/SignUp";
import ForgetPassword from "./components/Auth/SignIn/ForgetPassword";
import OTP from "./components/Auth/SignUp/OTP";
import ChoiceScreen from "./components/Auth/SignUp/ChoiceScreen";
import TrainerCoupon from "./components/Auth/SignUp/TrainerCoupon";
import Onboarding from "./components/Auth/SignUp/Onboarding";
import Dashboard from "./components/Dashboard/Dashboard";
import Welcome from "./components/Welcome";

// Protected route — redirects to /signin if not logged in
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? children : <Navigate to="/signin" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome Page */}
        <Route path="/" element={<Welcome />} />

        {/* Auth */}
        <Route path="/signin"          element={<SignIn />} />
        <Route path="/signup"          element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/otp"             element={<OTP />} />

        {/* Role selection flow */}
        <Route path="/choice"          element={<ChoiceScreen />} />
        <Route path="/trainer-coupon"  element={<TrainerCoupon />} />
        <Route path="/onboarding"      element={<Onboarding />} />

        {/* Main app */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;