import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"TripCompanion" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - TripCompanion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f0fdfa;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #0f172a;
              margin-top: 0;
            }
            .content p {
              color: #64748b;
              line-height: 1.6;
              font-size: 16px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 700;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ TripCompanion</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}! 👋</h2>
              <p>We received a request to reset your password for your TripCompanion account.</p>
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
              </div>

              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              
              <p style="margin-top: 30px; font-size: 14px; color: #94a3b8;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #0d9488; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 TripCompanion. All rights reserved.</p>
              <p>Your journey begins here 🌍</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', email);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendPasswordChangedConfirmation(email: string, userName: string) {
    const mailOptions = {
      from: `"TripCompanion" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - TripCompanion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f0fdfa;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #0f172a;
              margin-top: 0;
            }
            .content p {
              color: #64748b;
              line-height: 1.6;
              font-size: 16px;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            .success-icon {
              font-size: 60px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ TripCompanion</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2 style="text-align: center;">Password Changed Successfully!</h2>
              <p>Hello ${userName},</p>
              <p>Your password has been successfully changed. You can now log in with your new password.</p>
              <p>If you did not make this change, please contact our support team immediately.</p>
              <p style="margin-top: 30px;">Stay secure and happy travels! 🌍</p>
            </div>
            <div class="footer">
              <p>© 2026 TripCompanion. All rights reserved.</p>
              <p>Your journey begins here 🌍</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password changed confirmation sent to:', email);
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
    }
  }

  
}