/**
 * Auth Controller
 * Handles user registration with OTP verification, login by email/phone
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Allowed email domains
const allowedDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in',
    'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'me.com', 'mac.com',
    'protonmail.com', 'proton.me',
    'rediffmail.com', 'aol.com',
    'zoho.com', 'zoho.in',
    'yandex.com', 'mail.com',
];

// ─── In-memory OTP store (demo) ──────────────────────
// In production, use Redis or DB with TTL
const otpStore = new Map(); // key: email → { otp, data, expiresAt }

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// Step 1: Send OTP (stores registration data temporarily)
const sendOTP = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        // Validate email domain
        const domain = email?.split('@')[1]?.toLowerCase();
        if (!domain || !allowedDomains.includes(domain)) {
            return res.status(400).json({ error: 'Please use a popular email provider (Gmail, Yahoo, Outlook, iCloud, etc.)' });
        }

        // Check if user already exists (by email or phone)
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        if (phone) {
            const cleanPhone = phone.replace(/[\s\-()]/g, '');
            const existingPhone = await User.findOne({ phone: { $regex: cleanPhone.replace(/^\+91/, '').replace(/^91/, '').replace(/^0/, '') } });
            if (existingPhone) {
                return res.status(400).json({ error: 'Phone number is already registered' });
            }
        }

        const otp = generateOTP();
        otpStore.set(email.toLowerCase(), {
            otp,
            data: { name, email, phone, password },
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        });

        // Send OTP via email
        try {
            await sendOTPEmail(email, otp, 'registration', name);
        } catch (emailErr) {
            console.error('Failed to send OTP email:', emailErr.message || emailErr);
            // Remove stored OTP since email didn't go through
            otpStore.delete(email.toLowerCase());
            return res.status(500).json({ error: 'Failed to send OTP email. Please try again later.', detail: emailErr.message });
        }

        res.json({
            message: 'OTP sent to your email! Check your inbox (and spam folder).',
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// Step 2: Verify OTP and complete registration
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const stored = otpStore.get(email.toLowerCase());
        if (!stored) {
            return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email.toLowerCase());
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        }

        // OTP verified — create the user
        const { name, phone, password } = stored.data;
        const user = await User.create({ name, email, phone: phone || '', password });

        // Clean up OTP
        otpStore.delete(email.toLowerCase());

        res.status(201).json({
            message: 'Registration successful! Please login with your credentials.',
            user,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const stored = otpStore.get(email?.toLowerCase());
        if (!stored) {
            return res.status(400).json({ error: 'No pending registration found. Please start over.' });
        }

        const otp = generateOTP();
        stored.otp = otp;
        stored.expiresAt = Date.now() + 5 * 60 * 1000;

        // Send OTP via email
        try {
            await sendOTPEmail(email, otp, 'registration', stored.data.name);
        } catch (emailErr) {
            console.error('Failed to resend OTP email:', emailErr);
            return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
        }

        res.json({
            message: 'New OTP sent to your email!',
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Register (kept for backward compat but redirects to OTP flow)
const register = async (req, res) => {
    return sendOTP(req, res);
};

// Login user — accepts email OR phone
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Email/phone and password are required' });
        }

        // Determine if identifier is email or phone
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
        let user;

        if (isEmail) {
            user = await User.findOne({ email: identifier.trim().toLowerCase() }).select('+password');
        } else {
            // Clean phone: strip spaces, dashes, +91 prefix
            let cleanPhone = identifier.replace(/[\s\-()]/g, '');
            if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.slice(3);
            else if (cleanPhone.startsWith('91') && cleanPhone.length > 10) cleanPhone = cleanPhone.slice(2);
            else if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);

            // Search by last 10 digits
            user = await User.findOne({
                phone: { $regex: cleanPhone.slice(-10) + '$' }
            }).select('+password');
        }

        if (!user) {
            return res.status(401).json({
                error: 'No account found with this ' + (isEmail ? 'email' : 'phone number') + '. Time to join the cool kids club! 😎',
                code: 'USER_NOT_FOUND',
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Wrong password! Did your cat walk on the keyboard? 🐱',
                code: 'WRONG_PASSWORD',
            });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// Get current logged-in user
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── Forgot Password: Send Reset OTP ───
const forgotPassword = async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ error: 'Please enter your email or phone number' });
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
        let user;

        if (isEmail) {
            user = await User.findOne({ email: identifier.trim().toLowerCase() });
        } else {
            let cleanPhone = identifier.replace(/[\s\-()]/g, '');
            if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.slice(3);
            else if (cleanPhone.startsWith('91') && cleanPhone.length > 10) cleanPhone = cleanPhone.slice(2);
            else if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
            user = await User.findOne({ phone: { $regex: cleanPhone.slice(-10) + '$' } });
        }

        if (!user) {
            return res.status(404).json({
                error: 'No account found! Are you sure you signed up? Maybe it was a dream 🤔',
                code: 'USER_NOT_FOUND',
            });
        }

        const otp = generateOTP();
        otpStore.set('reset_' + user.email.toLowerCase(), {
            otp,
            userId: user._id,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        // Send reset OTP via email
        try {
            await sendOTPEmail(user.email, otp, 'reset', user.name);
        } catch (emailErr) {
            console.error('Failed to send reset OTP email:', emailErr);
            return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
        }

        res.json({
            message: 'Reset OTP sent to your email!',
            email: user.email,
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// ─── Reset Password ───
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP and new password are required' });
        }

        const stored = otpStore.get('reset_' + email.toLowerCase());
        if (!stored) {
            return res.status(400).json({ error: 'No reset request found. Please try again.' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete('reset_' + email.toLowerCase());
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Nice try though! 🕵️' });
        }

        const user = await User.findById(stored.userId).select('+password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        otpStore.delete('reset_' + email.toLowerCase());

        res.json({ message: 'Password reset successful! You can now login with your new password. 🎉' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

module.exports = { register, login, getMe, sendOTP, verifyOTP, resendOTP, forgotPassword, resetPassword };
