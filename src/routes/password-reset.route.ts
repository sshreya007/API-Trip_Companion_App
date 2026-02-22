import { Router } from 'express';
import { PasswordResetController } from '../controllers/password-reset.controller';

const router = Router();
const passwordResetController = new PasswordResetController();

// Request password reset
router.post('/forgot-password', passwordResetController.forgotPassword);

// Reset password with token
router.post('/reset-password', passwordResetController.resetPassword);

export default router;