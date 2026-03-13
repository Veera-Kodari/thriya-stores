/**
 * Email Service — Sends emails via Resend HTTP API
 * Uses Resend instead of SMTP because Render's free tier blocks SMTP ports 465/587
 */

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_GdVNAj1H_MwkGDBAbM2rUMGxFBLwbV7km';
const FROM_EMAIL = 'Thriya Stores <onboarding@resend.dev>';

const resend = new Resend(RESEND_API_KEY);

console.log('✉️  Email service ready (Resend HTTP API)');

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

    const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html: otpEmailTemplate(otp, purpose, userName),
    });

    if (error) {
        console.error(`❌ Resend OTP email error for ${to}:`, error);
        throw new Error(error.message || 'Failed to send email');
    }

    console.log(`📧 OTP email sent to ${to} (${purpose}) — Id: ${data.id}`);
    return { success: true, messageId: data.id };
};

/**
 * Send Order Confirmation Email
 */
const orderEmailTemplate = (order, userName) => {
    const itemsHtml = order.items.map((item) => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #222; font-weight: 500;">${item.name}</span>
                ${item.size ? `<br><span style="color: #888; font-size: 12px;">Size: ${item.size}</span>` : ''}
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.qty}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #222; font-weight: 500;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    const addr = order.shippingAddress;
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr><td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                <tr><td style="background: #222; padding: 24px 32px; text-align: center;">
                    <h1 style="margin: 0; color: #fff; font-size: 20px; letter-spacing: 3px; text-transform: uppercase;">Thriya Stores</h1>
                </td></tr>
                <tr><td style="padding: 32px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 40px;">✅</span>
                        <h2 style="margin: 8px 0 4px; color: #222; font-size: 20px;">Order Confirmed!</h2>
                        <p style="margin: 0; color: #888; font-size: 14px;">Hi ${userName || 'there'}, your order has been placed successfully.</p>
                    </div>
                    <div style="background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                        <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                        <p style="margin: 0; color: #222; font-size: 18px; font-weight: 700; letter-spacing: 1px;">#${order.orderNumber}</p>
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        <tr style="border-bottom: 2px solid #222;">
                            <td style="padding: 8px 0; font-weight: 600; color: #222; font-size: 13px;">Item</td>
                            <td style="padding: 8px 0; font-weight: 600; color: #222; font-size: 13px; text-align: center;">Qty</td>
                            <td style="padding: 8px 0; font-weight: 600; color: #222; font-size: 13px; text-align: right;">Amount</td>
                        </tr>
                        ${itemsHtml}
                        <tr>
                            <td colspan="2" style="padding: 14px 0 0; font-weight: 700; color: #222; font-size: 15px;">Total</td>
                            <td style="padding: 14px 0 0; font-weight: 700; color: #222; font-size: 15px; text-align: right;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                    <div style="background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
                        <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</p>
                        <p style="margin: 0; color: #222; font-size: 14px; line-height: 1.5;">
                            ${addr.fullName}<br>${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br>${addr.city}, ${addr.state} - ${addr.pincode}<br>Phone: ${addr.phone}
                        </p>
                    </div>
                    <p style="margin: 0; color: #888; font-size: 13px; text-align: center;">Payment: <strong>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</strong></p>
                </td></tr>
                <tr><td style="padding: 20px 32px; border-top: 1px solid #eee; text-align: center;">
                    <p style="margin: 0; color: #bbb; font-size: 11px;">&copy; ${new Date().getFullYear()} Thriya Stores &mdash; Traditional Indian Wear</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;
};

const sendOrderEmail = async (to, order, userName = '') => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: `Order Confirmed! #${order.orderNumber} — Thriya Stores`,
            html: orderEmailTemplate(order, userName),
        });

        if (error) {
            console.error(`❌ Order email failed for ${to}:`, error);
            return { success: false, error: error.message };
        }

        console.log(`📧 Order confirmation sent to ${to} — #${order.orderNumber}`);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error(`❌ Order email failed for ${to}:`, error.message);
        // Don't throw — order is already placed, email is best-effort
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPEmail, sendOrderEmail };
