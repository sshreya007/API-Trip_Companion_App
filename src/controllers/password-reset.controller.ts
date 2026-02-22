import { Request, Response, NextFunction } from 'express';
import { PasswordResetService } from '../services/password-reset.service';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos/password-reset.dto';

export class PasswordResetController {
  private passwordResetService: PasswordResetService;

  constructor() {
    this.passwordResetService = new PasswordResetService();
  }

  // Request password reset
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ForgotPasswordDto = req.body;

      const result = await this.passwordResetService.requestPasswordReset(data);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // Reset password with token
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ResetPasswordDto = req.body;

      const result = await this.passwordResetService.resetPassword(data);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };
}