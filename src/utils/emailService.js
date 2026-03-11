/**
 * Email Service — Sends OTP emails via Gmail SMTP using Nodemailer
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Verify connection on startup
transporter.verify()
    .then(() => console.log('✉️  Email service ready (Gmail SMTP)'))
    .catch((err) => console.error('❌ Email service error:', err.message));

/**
 * Generate a styled HTML email for OTP
 */
const otpEmailTemplate = (otp, purpose, userName) => {
    const purposeText = purpose === 'registration'
        ? 'complete your registration'
        : 'reset your password';

    const purposeTitle = purpose === 'registration'
        ? 'Verify Your Email'
        : 'Reset Your Password';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="420" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background: #222222; padding: 28px 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase;">
                                Thriya Stores
                            </h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 36px 32px 20px;">
                            <h2 style="margin: 0 0 8px; color: #222; font-size: 18px; font-weight: 600;">
                                ${purposeTitle}
                            </h2>
                            <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.5;">
                                Hi${userName ? ' ' + userName : ''},<br>
                                Use the OTP below to ${purposeText}. This code is valid for <strong>5 minutes</strong>.
                            </p>
                            <!-- OTP Box -->
                            <div style="text-align: center; margin: 24px 0;">
                                <div style="display: inline-block; background: #f8f8f8; border: 2px dashed #ddd; border-radius: 8px; padding: 16px 40px;">
                                    <span style="font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #222; font-family: 'Courier New', monospace;">
                                        ${otp}
                                    </span>
                                </div>
                            </div>
                            <p style="margin: 20px 0 0; color: #999; font-size: 12px; line-height: 1.5; text-align: center;">
                                If you didn't request this, you can safely ignore this email.<br>
                                Do not share this OTP with anyone.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 32px; border-top: 1px solid #eee; text-align: center;">
                            <p style="margin: 0; color: #bbb; font-size: 11px;">
                                &copy; ${new Date().getFullYear()} Thriya Stores &mdash; Traditional Indian Wear
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} purpose - 'registration' | 'reset'
 * @param {string} userName - Optional user name for greeting
 */
const sendOTPEmail = async (to, otp, purpose = 'registration', userName = '') => {
    const subject = purpose === 'registration'
        ? `${otp} is your Thriya Stores verification code`
        : `${otp} is your Thriya Stores password reset code`;

    const mailOptions = {
        from: `"Thriya Stores" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html: otpEmailTemplate(otp, purpose, userName),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 OTP email sent to ${to} (${purpose}) — MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPEmail };
