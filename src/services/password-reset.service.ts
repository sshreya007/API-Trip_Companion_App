import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { EmailService } from './email.service';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos/password-reset.dto';
import { HttpError } from '../errors/http-error';

export class PasswordResetService {
  private authRepository: AuthRepository;
  private emailService: EmailService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.emailService = new EmailService();
  }

  async requestPasswordReset(data: ForgotPasswordDto) {
    try {
      const { email } = data;

      console.log('📧 Password reset requested for:', email);

      // Find user by email
      const user = await this.authRepository.getUserByEmail(email);
      if (!user) {
        console.log('⚠️ No user found with email:', email);
        // Don't reveal if email exists or not (security)
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      console.log('✅ User found:', user.email);

      // Generate reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'reset-secret',
        { expiresIn: '1h' }
      );

      console.log('🔑 Reset token generated');

      // Save token to database
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      await this.authRepository.setResetToken(user._id.toString(), resetToken, expiresAt);

      console.log('💾 Reset token saved to database');

      // Send email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.firstName
      );

      console.log('✅ Password reset email sent successfully');

      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    } catch (error: any) {
      console.error('❌ Password reset request error:', error);
      throw new HttpError(500, 'Failed to process password reset request');
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      const { token, newPassword } = data;

      console.log('🔄 Processing password reset');

      // Validate password
      if (!newPassword || newPassword.length < 6) {
        throw new HttpError(400, 'Password must be at least 6 characters long');
      }

      // Verify token
      let decoded: any;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'reset-secret'
        );
        console.log('✅ Token verified');
      } catch (err) {
        console.error('❌ Token verification failed:', err);
        throw new HttpError(400, 'Invalid or expired reset token');
      }

      // Find user with valid token
      const user = await this.authRepository.findByResetToken(token);
      if (!user) {
        console.error('❌ No user found with valid reset token');
        throw new HttpError(400, 'Invalid or expired reset token');
      }

      console.log('✅ User found:', user.email);

      // Update password
      await this.authRepository.updatePassword(user._id.toString(), newPassword);
      console.log('✅ Password updated');

      // Clear reset token
      await this.authRepository.clearResetToken(user._id.toString());
      console.log('✅ Reset token cleared');

      // Send confirmation email
      await this.emailService.sendPasswordChangedConfirmation(user.email, user.firstName);
      console.log('✅ Confirmation email sent');

      return { message: 'Password has been reset successfully' };
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, 'Failed to reset password');
    }
  }
}
