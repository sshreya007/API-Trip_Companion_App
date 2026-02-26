import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import jwt from 'jsonwebtoken';

describe('Password Reset API Integration Tests', () => {
  const testUser = {
    firstName: 'Reset',
    lastName: 'User',
    username: 'resetuser',
    email: 'reset@test.com',
    password: 'oldpassword123',
  };

  let userId: string;

  beforeAll(async () => {
    // Clean up
    await User.deleteOne({ email: testUser.email });

    // Create test user
    const user = await User.create(testUser);
    userId = user._id.toString();
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  // ==================== FORGOT PASSWORD ====================

  describe('POST /api/auth/forgot-password', () => {
    test('56. Should request password reset with valid email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset link');
    });

    test('57. Should not reveal if email does not exist (security)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset link');
    });

    test('58. Should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== RESET PASSWORD ====================

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeAll(() => {
      // Generate a valid reset token
      resetToken = jwt.sign(
        { userId: userId, email: testUser.email },
        process.env.JWT_RESET_SECRET || 'test-reset-secret',
        { expiresIn: '1h' }
      );

      // Save the token to the user
      User.findByIdAndUpdate(userId, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
      }).exec();
    });

    test('59. Should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset successfully');

      // Verify can login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'newpassword123',
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    test('60. Should fail to reset password with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});