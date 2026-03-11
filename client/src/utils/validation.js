/**
 * Modern form validation utilities
 */

export const validateName = (name) => {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
  return '';
};

const allowedDomains = [
  'gmail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in',
  'outlook.com', 'hotmail.com', 'live.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'rediffmail.com', 'aol.com',
  'zoho.com', 'zoho.in',
  'yandex.com', 'mail.com',
];

export const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  const domain = email.trim().split('@')[1].toLowerCase();
  if (!allowedDomains.includes(domain)) {
    return 'Please use a popular email provider (Gmail, Yahoo, Outlook, iCloud, etc.)';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return 'Password must contain at least one special character';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: '#ef4444', percent: 33 };
  if (score <= 4) return { label: 'Medium', color: '#f59e0b', percent: 66 };
  return { label: 'Strong', color: '#22c55e', percent: 100 };
};
