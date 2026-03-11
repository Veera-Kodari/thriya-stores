import React, { useState, useRef, useEffect } from 'react';
import { sendOTP, verifyOTP, resendOTP as resendOTPApi } from '../services/api';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from '../utils/validation';

// Indian phone validation
const validatePhone = (phone) => {
  if (!phone.trim()) return ''; // optional
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (/^(\+91|91|0)?[6-9]\d{9}$/.test(cleaned)) return '';
  return 'Enter a valid Indian mobile number (10 digits starting with 6-9)';
};

const formatPhoneInput = (value) => {
  let raw = value.replace(/^\+91[\s-]?/, '');
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length > 10) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return '';
  if (digits.length <= 5) return `+91 ${digits}`;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

function Register({ onRegisterSuccess, onSwitch }) {
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  const passwordStrength = getPasswordStrength(form.password);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const validate = () => {
    const newErrors = {};
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    const passErr = validatePassword(form.password);
    const confirmErr = validateConfirmPassword(form.password, form.confirmPassword);

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (phoneErr) newErrors.phone = phoneErr;
    if (passErr) newErrors.password = passErr;
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm({ ...form, phone: formatPhoneInput(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (serverError) setServerError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    switch (name) {
      case 'name': error = validateName(value); break;
      case 'email': error = validateEmail(value); break;
      case 'phone': error = validatePhone(value); break;
      case 'password': error = validatePassword(value); break;
      case 'confirmPassword': error = validateConfirmPassword(form.password, value); break;
      default: break;
    }
    if (error) setErrors({ ...errors, [name]: error });
  };

  // Step 1: Submit form → send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    try {
      const data = await sendOTP({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      if (data.error) {
        setServerError(data.error);
      } else {
        setStep('otp');
        setResendTimer(30);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      setServerError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // OTP input handlers
  const handleOTPChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
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

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setOtpError('');
    try {
      const data = await verifyOTP({ email: form.email, otp: otpString });
      if (data.error) {
        setOtpError(data.error);
      } else {
        setStep('success');
        setTimeout(() => {
          if (onRegisterSuccess) onRegisterSuccess();
        }, 2500);
      }
    } catch (err) {
      setOtpError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const data = await resendOTPApi({ email: form.email });
      if (data.error) {
        setOtpError(data.error);
      } else {
        setResendTimer(30);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      setOtpError('Failed to resend OTP');
    }
    setLoading(false);
  };

  // ─── Success Screen ───
  if (step === 'success') {
    return (
      <div className="auth-form otp-success">
        <div className="success-icon">✓</div>
        <h3 className="success-title">Registration Successful!</h3>
        <p className="success-text">Your account has been verified. Redirecting to login...</p>
        <div className="success-loader"></div>
      </div>
    );
  }

  // ─── OTP Verification Screen ───
  if (step === 'otp') {
    return (
      <div className="auth-form otp-form">
        <div className="otp-header">
          <h3>Verify Your Email</h3>
          <p>We've sent a 6-digit OTP to <strong>{form.email}</strong></p>
        </div>

        {otpError && <div className="error-banner">{otpError}</div>}

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
          {loading ? 'Verifying...' : 'Verify & Register'}
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
          <button type="button" className="link-btn" onClick={() => setStep('form')}>
            ← Change email
          </button>
        </div>
      </div>
    );
  }

  // ─── Registration Form ───
  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="error-banner">{serverError}</div>}

      <div className="form-group">
        <label htmlFor="reg-name">Full Name</label>
        <input
          id="reg-name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.name ? 'input-error' : ''}
          autoComplete="name"
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          name="email"
          placeholder="you@gmail.com"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? 'input-error' : ''}
          autoComplete="email"
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-phone">Phone Number <span className="optional-label">(optional)</span></label>
        <input
          id="reg-phone"
          type="tel"
          name="phone"
          placeholder="+91 XXXXX XXXXX"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.phone ? 'input-error' : ''}
          autoComplete="tel"
          maxLength={16}
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-password">Password</label>
        <div className="password-wrapper">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Min 8 chars, upper, lower, number, special"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.password ? 'input-error' : ''}
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
        {form.password && (
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
        {errors.password && <span className="field-error">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-confirm">Confirm Password</label>
        <div className="password-wrapper">
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.confirmPassword ? 'input-error' : ''}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Sending OTP...' : 'Continue'}
      </button>

      <p className="switch-text">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitch}>
          Login here
        </button>
      </p>
    </form>
  );
}

export default Register;
