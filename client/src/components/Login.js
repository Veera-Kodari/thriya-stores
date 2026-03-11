import React, { useState, useEffect } from 'react';
import { loginUser } from '../services/api';

// Funny messages for wrong password (random pick)
const wrongPasswordMessages = [
  "Wrong password! Did your cat walk on the keyboard? 🐱",
  "Nope, that's not it! Try again, keyboard warrior! ⚔️",
  "Password rejected! Was that your WiFi password? 📶",
  "Oops! That password is more wrong than pineapple on pizza 🍕",
  "Access denied! Even hackers do better than this 😅",
  "Wrong password! Have you tried 'password123'? Just kidding, don't! 🙃",
];

// Funny messages for user not found (random pick)
const notRegisteredMessages = [
  "Who are you? 🤔 We don't have you in our records!",
  "Stranger danger! 🚨 You're not registered yet!",
  "404: Human not found! Time to register? 🧐",
  "We searched everywhere... even under the couch. You're not here! 🛋️",
  "Our database says 'Who dis?' Create an account first! 📱",
];

// Detect if input is a phone number (Indian)
const isPhoneInput = (value) => {
  const cleaned = value.replace(/[\s\-()]/g, '');
  return /^(\+91|91|0)?[6-9]\d{0,9}$/.test(cleaned) || /^\d+$/.test(cleaned.replace(/^\+/, ''));
};

const validateIdentifier = (value) => {
  if (!value.trim()) return 'Email or phone number is required';
  const cleaned = value.replace(/[\s\-()]/g, '');
  if (/^\+?\d+$/.test(cleaned) || /^(\+91|91|0)?[6-9]/.test(cleaned)) {
    if (/^(\+91|91|0)?[6-9]\d{9}$/.test(cleaned)) return '';
    return 'Enter a valid 10-digit Indian mobile number';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Please enter a valid email or phone number';
  }
  return '';
};

function Login({ onAuth, onSwitch, onForgotPassword, incomingMessage }) {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Show incoming message (e.g. after password reset)
  useEffect(() => {
    if (incomingMessage) {
      setSuccessMessage(incomingMessage);
      const t = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(t);
    }
  }, [incomingMessage]);

  const validate = () => {
    const newErrors = {};
    const idErr = validateIdentifier(form.identifier);
    if (idErr) newErrors.identifier = idErr;
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (serverError) { setServerError(''); setErrorCode(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    setErrorCode('');
    try {
      const data = await loginUser({ identifier: form.identifier.trim(), password: form.password });
      if (data.error) {
        if (data.code === 'USER_NOT_FOUND') {
          const funnyMsg = notRegisteredMessages[Math.floor(Math.random() * notRegisteredMessages.length)];
          setServerError(funnyMsg);
          setErrorCode('USER_NOT_FOUND');
        } else if (data.code === 'WRONG_PASSWORD') {
          const funnyMsg = wrongPasswordMessages[Math.floor(Math.random() * wrongPasswordMessages.length)];
          setServerError(funnyMsg);
          setErrorCode('WRONG_PASSWORD');
        } else {
          setServerError(data.error);
        }
      } else {
        onAuth(data.user, data.token);
      }
    } catch (err) {
      setServerError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const identifierIsPhone = isPhoneInput(form.identifier);

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {serverError && (
        <div className={`error-banner ${errorCode === 'USER_NOT_FOUND' ? 'error-not-found' : errorCode === 'WRONG_PASSWORD' ? 'error-wrong-pass' : ''}`}>
          <span>{serverError}</span>
          {errorCode === 'USER_NOT_FOUND' && (
            <button type="button" className="error-action-btn" onClick={onSwitch}>
              Register Now →
            </button>
          )}
          {errorCode === 'WRONG_PASSWORD' && (
            <button type="button" className="error-action-btn" onClick={onForgotPassword}>
              Forgot Password?
            </button>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="login-identifier">Email or Phone Number</label>
        <input
          id="login-identifier"
          type={identifierIsPhone ? 'tel' : 'email'}
          name="identifier"
          placeholder="you@gmail.com or +91 XXXXX XXXXX"
          value={form.identifier}
          onChange={handleChange}
          className={errors.identifier ? 'input-error' : ''}
          autoComplete={identifierIsPhone ? 'tel' : 'email'}
        />
        {errors.identifier && <span className="field-error">{errors.identifier}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <div className="password-wrapper">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'input-error' : ''}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <span className="field-error">{errors.password}</span>}
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="auth-links">
        <button type="button" className="link-btn" onClick={onForgotPassword}>
          Forgot Password?
        </button>
        <p className="switch-text">
          Don't have an account?{' '}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Register here
          </button>
        </p>
      </div>
    </form>
  );
}

export default Login;
