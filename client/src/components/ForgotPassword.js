import React, { useState, useRef, useEffect } from 'react';
import { forgotPassword, resetPassword } from '../services/api';
import { validatePassword, getPasswordStrength } from '../utils/validation';

// Funny messages
const funnyResetMessages = [
  "Forgot your password? Happens to the best of us! 🧠",
  "Memory is overrated anyway. Let's fix this! 🔧",
  "Don't worry, even elephants forget sometimes! 🐘",
];

function ForgotPassword({ onBack, onResetSuccess }) {
  const [step, setStep] = useState('identify'); // 'identify' | 'verify' | 'newpass' | 'success'
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const passwordStrength = getPasswordStrength(newPassword);
  const funnyHeader = funnyResetMessages[Math.floor(Math.random() * funnyResetMessages.length)];

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Step 1: Enter email/phone to get reset OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await forgotPassword({ identifier: identifier.trim() });
      if (data.error) {
        setError(data.error);
      } else {
        setEmail(data.email);
        setStep('verify');
        setResendTimer(30);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // OTP input handlers
  const handleOTPChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  // Step 2: Verify OTP → go to new password
  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setStep('newpass');
    setError('');
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const data = await forgotPassword({ identifier: identifier.trim() });
      if (data.error) {
        setError(data.error);
      } else {
        setResendTimer(30);
        setOtp(['', '', '', '', '', '']);
        setError('');
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to resend OTP');
    }
    setLoading(false);
  };

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passErr = validatePassword(newPassword);
    if (passErr) { setPasswordError(passErr); return; }
    if (newPassword !== confirmPassword) { setConfirmError('Passwords do not match. Twins only! 👯'); return; }

    setLoading(true);
    setError('');
    try {
      const data = await resetPassword({
        email,
        otp: otp.join(''),
        newPassword,
      });
      if (data.error) {
        setError(data.error);
      } else {
        setStep('success');
        setTimeout(() => {
          if (onResetSuccess) onResetSuccess();
        }, 2500);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // ─── Success Screen ───
  if (step === 'success') {
    return (
      <div className="auth-form otp-success">
        <div className="success-icon">🔑</div>
        <h3 className="success-title">Password Reset!</h3>
        <p className="success-text">Your password has been updated. Don't forget it this time! 😄</p>
        <div className="success-loader"></div>
      </div>
    );
  }

  // ─── New Password Screen ───
  if (step === 'newpass') {
    return (
      <form className="auth-form" onSubmit={handleResetPassword} noValidate>
        <div className="otp-header">
          <h3>Create New Password</h3>
          <p>Make it strong, make it memorable... or just write it down somewhere safe 📝</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <div className="password-wrapper">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, upper, lower, number, special"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
              className={passwordError ? 'input-error' : ''}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {newPassword && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{ width: `${passwordStrength.percent}%`, backgroundColor: passwordStrength.color }}
                />
              </div>
              <span style={{ color: passwordStrength.color, fontSize: '0.75rem' }}>
                {passwordStrength.label}
              </span>
            </div>
          )}
          {passwordError && <span className="field-error">{passwordError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <input
            id="confirm-new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(''); }}
            className={confirmError ? 'input-error' : ''}
            autoComplete="new-password"
          />
          {confirmError && <span className="field-error">{confirmError}</span>}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <button type="button" className="link-btn" onClick={() => setStep('verify')}>
          ← Back
        </button>
      </form>
    );
  }

  // ─── OTP Verification Screen ───
  if (step === 'verify') {
    return (
      <div className="auth-form otp-form">
        <div className="otp-header">
          <h3>Verify Your Identity</h3>
          <p>We've sent a 6-digit OTP to <strong>{email}</strong></p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="otp-inputs" onPaste={handleOTPPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (otpRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOTPChange(i, e.target.value)}
              onKeyDown={(e) => handleOTPKeyDown(i, e)}
              className={`otp-input ${digit ? 'filled' : ''}`}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button
          className="submit-btn"
          onClick={handleVerifyOTP}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="otp-footer">
          <p>
            Didn't receive the OTP?{' '}
            {resendTimer > 0 ? (
              <span className="resend-timer">Resend in {resendTimer}s</span>
            ) : (
              <button type="button" className="link-btn" onClick={handleResendOTP} disabled={loading}>
                Resend OTP
              </button>
            )}
          </p>
          <button type="button" className="link-btn" onClick={() => setStep('identify')}>
            ← Change email/phone
          </button>
        </div>
      </div>
    );
  }

  // ─── Enter Email/Phone Screen ───
  return (
    <form className="auth-form" onSubmit={handleSendOTP} noValidate>
      <div className="forgot-header">
        <div className="forgot-icon">🔒</div>
        <h3>Forgot Password?</h3>
        <p>{funnyHeader}</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label htmlFor="forgot-identifier">Email or Phone Number</label>
        <input
          id="forgot-identifier"
          type="text"
          placeholder="Enter your registered email or phone"
          value={identifier}
          onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
          className={error ? 'input-error' : ''}
          autoComplete="email"
          autoFocus
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Sending OTP...' : 'Send Reset OTP'}
      </button>

      <button type="button" className="link-btn" onClick={onBack}>
        ← Back to Login
      </button>
    </form>
  );
}

export default ForgotPassword;
