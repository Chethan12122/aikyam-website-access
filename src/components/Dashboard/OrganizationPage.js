import React, { useEffect, useState } from "react";
import "./OrganizationPage.css";

const OrganizationPage = ({ userEmail }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userEmail) {
      fetchOrganizationMembers();
    } else {
      setLoading(false);
      setError("User email not found.");
    }
  }, [userEmail]);

  const fetchOrganizationMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://aikyam-hkfac5a0c6h5bqhe.centralindia-01.azurewebsites.net/api/organization/members/${userEmail}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch organization members");
      }

      const data = await response.json();

      console.log("Organization API Response:", data);

      // IMPORTANT: Your API returns direct array, not { users: [...] }
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching organization members:", err);
      setError("Unable to load organization members.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organization-page">
      <div className="organization-header">
        <h2>Organization</h2>
        <p>Your connected members</p>
      </div>

      {loading ? (
        <div className="organization-loading">
          <div className="organization-spinner"></div>
          <p>Loading members...</p>
        </div>
      ) : error ? (
        <div className="organization-empty">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="organization-empty">
          <h3>No Members Found</h3>
          <p>No users are connected to your organization yet.</p>
        </div>
      ) : (
        <div className="organization-list">
          {members.map((member) => (
            <div key={member.id} className="organization-card">
              <div className="organization-avatar">
                {member.name ? member.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div className="organization-info">
                <h3>{member.name || "Unnamed User"}</h3>
                <p>{member.email}</p>

                <div className="organization-meta">
                  <span className={`organization-role ${member.role?.toLowerCase()}`}>
                    {member.role || "Unknown"}
                  </span>

                  <span className={`organization-status ${member.status?.toLowerCase()}`}>
                    {member.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationPage;