import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Onboarding.css";

const STEPS = ["name", "gender", "dob", "weight", "height", "sport"];
const TOTAL = STEPS.length;

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = "", role = "athlete" } = location.state || {};

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    weight: 60,
    height: 160,
    sport: "",
  });

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // ── Validate current step ────────────────────────────────────
  const isStepValid = () => {
    const key = STEPS[step];
    const val = formData[key];
    if (key === "weight") return val >= 30;
    if (key === "height") return val >= 100;
    return String(val).trim().length > 0;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setError("Please fill in the required field to proceed.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep((s) => s - 1);
  };

  // ── Submit (mirrors Flutter's SubmitData → /api/details) ─────
  const handleSubmit = async () => {
    if (!isStepValid()) {
      setError("Please complete all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            weight: formData.weight,
            height: formData.height,
            primarySport: formData.sport,
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (response.ok) {
        navigate("/dashboard", { replace: true });
      } else {
        setError("Failed to save your details. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / TOTAL) * 100;

  return (
    <div className="ob-page">
      <div className="ob-blob-tr" />

      <div className="ob-container">
        {/* Progress bar — mirrors Flutter's LinearProgressIndicator */}
        <div className="ob-progress-wrap">
          <div className="ob-progress-bar">
            <div
              className="ob-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="ob-step-counter">{step + 1} / {TOTAL}</span>
        </div>

        {/* Step content */}
        <div className="ob-step-content" key={step}>
          {step === 0 && (
            <StepName value={formData.name} onChange={(v) => update("name", v)} />
          )}
          {step === 1 && (
            <StepGender value={formData.gender} onChange={(v) => update("gender", v)} />
          )}
          {step === 2 && (
            <StepDOB value={formData.dob} onChange={(v) => update("dob", v)} />
          )}
          {step === 3 && (
            <StepWeight value={formData.weight} onChange={(v) => update("weight", v)} />
          )}
          {step === 4 && (
            <StepHeight value={formData.height} onChange={(v) => update("height", v)} />
          )}
          {step === 5 && (
            <StepSport value={formData.sport} onChange={(v) => update("sport", v)} />
          )}
        </div>

        {error && <p className="ob-error">{error}</p>}

        {/* Navigation — mirrors Flutter's back/forward CircleAvatar buttons */}
        <div className="ob-nav">
          {step > 0 ? (
            <button className="ob-nav-btn" onClick={handlePrev}>←</button>
          ) : (
            <span className="ob-nav-spacer" />
          )}

          {step < TOTAL - 1 ? (
            <button className="ob-nav-btn ob-nav-primary" onClick={handleNext}>→</button>
          ) : (
            <button
              className="ob-nav-btn ob-nav-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <span className="ob-spinner" /> : "✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Step Components ──────────────────────────────────────────

const StepName = ({ value, onChange }) => (
  <div className="ob-step">
    <div className="ob-step-emoji">👋</div>
    <h2 className="ob-step-title">How can we remember you?</h2>
    <input
      className="ob-text-input"
      type="text"
      placeholder="Enter Your Name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
  </div>
);

const StepGender = ({ value, onChange }) => (
  <div className="ob-step">
    <h2 className="ob-step-title ob-step-title-lg">Gender</h2>
    <div className="ob-gender-row">
      {[
        { label: "Male",   emoji: "👨", val: "male"   },
        { label: "Female", emoji: "👩", val: "female" },
        { label: "Other",  emoji: "🧑", val: "other"  },
      ].map((g) => (
        <button
          key={g.val}
          className={`ob-gender-btn ${value === g.val ? "ob-gender-selected" : ""}`}
          onClick={() => onChange(g.val)}
        >
          <span className="ob-gender-emoji">{g.emoji}</span>
          <span>{g.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const StepDOB = ({ value, onChange }) => (
  <div className="ob-step">
    <div className="ob-step-emoji">📅</div>
    <h2 className="ob-step-title">Date of Birth</h2>
    <input
      className="ob-text-input ob-dob-input"
      type="date"
      value={value}
      max={new Date().toISOString().split("T")[0]}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const StepWeight = ({ value, onChange }) => (
  <div className="ob-step">
    <div className="ob-step-emoji">⚖️</div>
    <h2 className="ob-step-title">Weight</h2>
    <p className="ob-picker-value">{value} <span>kg</span></p>
    <input
      className="ob-slider"
      type="range"
      min={30} max={150} step={1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <div className="ob-slider-labels"><span>30 kg</span><span>150 kg</span></div>
  </div>
);

const StepHeight = ({ value, onChange }) => (
  <div className="ob-step">
    <div className="ob-step-emoji">📏</div>
    <h2 className="ob-step-title">Height</h2>
    <p className="ob-picker-value">{value} <span>cm</span></p>
    <input
      className="ob-slider"
      type="range"
      min={100} max={250} step={1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <div className="ob-slider-labels"><span>100 cm</span><span>250 cm</span></div>
  </div>
);

const StepSport = ({ value, onChange }) => (
  <div className="ob-step">
    <div className="ob-step-emoji">🏅</div>
    <h2 className="ob-step-title">What's your primary sport?</h2>
    <input
      className="ob-text-input"
      type="text"
      placeholder="Enter Your Primary Sport"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
  </div>
);

export default Onboarding;