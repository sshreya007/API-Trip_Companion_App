import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { connectDB } from '../../database/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Setup
beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_RESET_SECRET = 'test-reset-secret';
  process.env.EMAIL_USER = 'test@example.com';
  process.env.EMAIL_PASS = 'test-password';
  process.env.CLIENT_URL = 'http://localhost:3000';
  
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

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

    test('58. Should accept request even with empty email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: '',
        });

      // Your service returns 200 for security (doesn't reveal if email exists)
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('61. Should handle multiple password reset requests', async () => {
      // First request
      const res1 = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      expect(res1.statusCode).toBe(200);
      expect(res1.body.success).toBe(true);

      // Second request (should also succeed)
      const res2 = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.success).toBe(true);
    });

    test('62. Should handle case-sensitive email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'RESET@TEST.COM', // Uppercase
        });

      // Your service will return 200 regardless
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== RESET PASSWORD ====================

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeAll(async () => {
      // Generate a valid reset token
      resetToken = jwt.sign(
        { userId: userId, email: testUser.email },
        process.env.JWT_RESET_SECRET || 'test-reset-secret',
        { expiresIn: '1h' }
      );

      // Save the token to the user
      await User.findByIdAndUpdate(userId, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
      });
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

    test('63. Should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '123', // Too short
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 6 characters');
    });

    test('64. Should fail with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          // newPassword missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('65. Should fail with expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: userId, email: testUser.email },
        process.env.JWT_RESET_SECRET || 'test-reset-secret',
        { expiresIn: '-1h' } // Already expired
      );

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});