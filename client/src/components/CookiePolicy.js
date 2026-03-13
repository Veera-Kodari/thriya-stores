import React from 'react';
import { useNavigate } from 'react-router-dom';

function CookiePolicy() {
  const navigate = useNavigate();

  return (
    <div className="static-page">
      <nav className="static-nav">
        <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="brand-mark">T</span>
          <span className="brand-text">THRIYA</span>
        </div>
        <button className="static-back" onClick={() => navigate(-1)}>← Back</button>
      </nav>

      <div className="static-content">
        <h1>Cookie Policy</h1>
        <p className="static-updated">Last updated: March 2026</p>

        <section>
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit our website. They help us provide a better
            shopping experience by remembering your preferences and login session.
          </p>
        </section>

        <section>
          <h2>How We Use Cookies</h2>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for login, cart functionality, and site security.</li>
            <li><strong>Session Cookies:</strong> Keep you logged in during your browsing session.</li>
            <li><strong>Preference Cookies:</strong> Remember your cart items and recently viewed products.</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Cookies</h2>
          <p>
            We do not use any third-party tracking or advertising cookies. Your browsing data is not shared with
            any external analytics or ad platforms.
          </p>
        </section>

        <section>
          <h2>Managing Cookies</h2>
          <p>
            You can manage or delete cookies through your browser settings. Please note that disabling essential cookies
            may affect your ability to use certain features like the shopping cart and login.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have questions about our cookie practices, contact us at <strong>support@thriya.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default CookiePolicy;
