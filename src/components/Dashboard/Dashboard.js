import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import OrganizationPage from "./OrganizationPage";

// ── Page Placeholders ────────────────────────────────────────
const HomePlaceholder = ({ userRole }) => (
  <div className="page-placeholder">
    <div className="placeholder-icon">🏠</div>
    <h2>Home</h2>
    <p>Dashboard content coming soon</p>
    {userRole && <span className="role-badge">{userRole}</span>}
  </div>
);

const UsersPlaceholder = () => (
  <div className="page-placeholder">
    <div className="placeholder-icon">👥</div>
    <h2>Users</h2>
    <p>Team members will appear here</p>
  </div>
);

const SessionPlaceholder = () => (
  <div className="page-placeholder">
    <div className="placeholder-icon">🏋️</div>
    <h2>Session</h2>
    <p>Workout sessions will appear here</p>
  </div>
);

const DevicesPlaceholder = () => (
  <div className="page-placeholder">
    <div className="placeholder-icon">📡</div>
    <h2>Devices</h2>
    <p>Connected devices will appear here</p>
  </div>
);

const ProfilePlaceholder = ({ userEmail }) => (
  <div className="page-placeholder">
    <div className="placeholder-icon">👤</div>
    <h2>Profile</h2>
    <p>{userEmail}</p>
  </div>
);

// ── Nav Icons (SVG inline — mirrors Flutter SVG assets) ──────
const HomeIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
      stroke={active ? "var(--primary)" : "var(--nav-inactive)"}
      strokeWidth="1.8" strokeLinejoin="round" fill={active ? "var(--primary-light)" : "none"} />
    <path d="M9 21V12h6v9" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const UsersIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="4" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" />
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const SessionIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="2" strokeLinecap="round" />
    <circle cx="6.5" cy="6.5" r="2.5" fill={active ? "var(--primary)" : "var(--nav-inactive)"} />
    <circle cx="17.5" cy="6.5" r="2.5" fill={active ? "var(--primary)" : "var(--nav-inactive)"} />
    <circle cx="6.5" cy="17.5" r="2.5" fill={active ? "var(--primary)" : "var(--nav-inactive)"} />
    <circle cx="17.5" cy="17.5" r="2.5" fill={active ? "var(--primary)" : "var(--nav-inactive)"} />
  </svg>
);

const DevicesIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="8" width="16" height="11" rx="2" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" />
    <path d="M8 8V6a4 4 0 018 0v2" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="13.5" r="1.5" fill={active ? "var(--primary)" : "var(--nav-inactive)"} />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" />
    <path d="M4 20v-1a8 8 0 0116 0v1" stroke={active ? "var(--primary)" : "var(--nav-inactive)"} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const OrganizationIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 21V7a1 1 0 011-1h4a1 1 0 011 1v14M13 21V3a1 1 0 011-1h4a1 1 0 011 1v18M9 10h2M9 14h2M9 18h2M16 7h2M16 11h2M16 15h2"
      stroke={active ? "var(--primary)" : "var(--nav-inactive)"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Main Dashboard ───────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [roleLoading, setRoleLoading] = useState(true);

  // Read email from localStorage (set during sign-in)
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    setUserEmail(email);
    if (email) fetchUserRole(email);
    else setRoleLoading(false);
  }, []);

  // Mirrors Flutter's fetchUserRole()
  const fetchUserRole = async (email) => {
    try {
      const response = await fetch(
        `https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/details/${email}`
      );
      if (response.ok) {
        const json = await response.json();
        const role = json?.data?.user?.role?.trim().toLowerCase();
        setUserRole(role);
      }
    } catch (e) {
      // Keep UI working even if role fetch fails
    } finally {
      setRoleLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    navigate("/signin");
  };

  // ── Nav items — trainer gets Devices tab, athlete doesn't ──
const navItems = [
  { label: "Home", Icon: HomeIcon, page: <HomePlaceholder userRole={userRole} /> },
  { label: "Users", Icon: UsersIcon, page: <UsersPlaceholder /> },
  { label: "Session", Icon: SessionIcon, page: <SessionPlaceholder /> },
  { label: "Organization", Icon: OrganizationIcon, page: <OrganizationPage userEmail={userEmail} /> },
  ...(userRole === "trainer"
    ? [{ label: "Devices", Icon: DevicesIcon, page: <DevicesPlaceholder /> }]
    : []),
  { label: "Profile", Icon: ProfileIcon, page: <ProfilePlaceholder userEmail={userEmail} /> },
];

  // Clamp index if role switches
  const safeIndex = selectedIndex < navItems.length ? selectedIndex : 0;

  return (
    <div className="dashboard-root">

      {/* ── Top AppBar ── */}
      <header className="dashboard-appbar">
        <div className="appbar-logo">
          <div className="appbar-logo-mark">A</div>
          <span className="appbar-brand">Aikyam</span>
        </div>
        <div className="appbar-right">
          {roleLoading ? (
            <span className="role-loading-dot" />
          ) : userRole ? (
            <span className={`appbar-role-badge ${userRole}`}>{userRole}</span>
          ) : null}
          <button className="appbar-notif" title="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="appbar-logout" onClick={handleLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="dashboard-body">
        {roleLoading ? (
          <div className="role-loading-screen">
            <div className="loading-spinner-lg" />
            <p>Loading your dashboard…</p>
          </div>
        ) : (
          <div className="page-fade-in" key={safeIndex}>
            {navItems[safeIndex].page}
          </div>
        )}
      </main>

      {/* ── Bottom Navigation Bar ── */}
      <nav className="bottom-nav">
        {navItems.map((item, index) => {
          const active = index === safeIndex;
          return (
            <button
              key={item.label}
              className={`nav-item ${active ? "nav-item--active" : ""}`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="nav-icon-wrap">
                <item.Icon active={active} />
                {active && <span className="nav-active-dot" />}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default Dashboard;