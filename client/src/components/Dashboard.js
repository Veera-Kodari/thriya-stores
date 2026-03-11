import React, { useEffect, useState } from 'react';
import { getMe } from '../services/api';

function Dashboard({ user, token, onLogout }) {
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    if (token && !profile) {
      getMe(token).then((data) => {
        if (data.error) {
          onLogout();
        } else {
          setProfile(data);
        }
      });
    }
  }, [token, profile, onLogout]);

  return (
    <div className="app">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {profile?.name || 'User'}!</h1>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
        <div className="dashboard-card">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{profile?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{profile?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Joined:</span>
              <span className="info-value">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
        </div>
        <div className="dashboard-card">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Tutorials</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1</span>
              <span className="stat-label">Days Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
