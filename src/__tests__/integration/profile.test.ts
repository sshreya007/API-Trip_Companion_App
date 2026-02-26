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

describe('Profile API Integration Tests', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: { $in: ['profile@test.com', 'another@test.com'] } });

    // Create test user
    const user = await User.create({
      firstName: 'Profile',
      lastName: 'User',
      username: 'profileuser',
      email: 'profile@test.com',
      password: 'password123',
      role: 'user',
    });
    userId = user._id.toString();

    userToken = jwt.sign(
      { userId: userId, role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['profile@test.com', 'another@test.com'] } });
  });

  // ==================== GET PROFILE ====================

  describe('GET /api/profile/:userId', () => {
    test('61. Should get user profile with userId', async () => {
      const res = await request(app)
        .get(`/api/profile/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('profile@test.com');
      expect(res.body.data.password).toBeUndefined();
    });

    test('62. Should fail to get profile with invalid userId', async () => {
      const res = await request(app)
        .get('/api/profile/invalid-user-id');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('63. Should fail to get profile with non-existent userId', async () => {
      const res = await request(app)
        .get('/api/profile/507f1f77bcf86cd799439011');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== UPDATE PROFILE ====================

  describe('PUT /api/profile/:userId', () => {
    test('64. Should update profile with valid data', async () => {
      const res = await request(app)
        .put(`/api/profile/${userId}`)
        .send({
          name: 'Updated Name',
          bio: 'Updated bio',
          age: 25,
          gender: 'Male',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('65. Should fail to update profile with invalid userId', async () => {
      const res = await request(app)
        .put('/api/profile/invalid-user-id')
        .send({
          name: 'Updated Name',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('66. Should update only provided fields', async () => {
      const res = await request(app)
        .put(`/api/profile/${userId}`)
        .send({
          bio: 'Only bio updated',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== UPLOAD PROFILE IMAGE ====================

  describe('POST /api/profile/upload', () => {
    test('67. Should fail to upload without file', async () => {
      const res = await request(app)
        .post('/api/profile/upload')
        .send({
          userId: userId,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No image file');
    });

    test('68. Should fail to upload without userId', async () => {
      const res = await request(app)
        .post('/api/profile/upload')
        .attach('image', Buffer.from('fake image'), 'test.jpg');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User ID is required');
    });
  });
});