import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import jwt from 'jsonwebtoken';

describe('Profile API Integration Tests', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up
    await User.deleteOne({ email: 'profile@test.com' });

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
    await User.deleteOne({ email: 'profile@test.com' });
  });

  // ==================== GET PROFILE ====================

  describe('GET /api/profile', () => {
    test('61. Should get user profile', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('profile@test.com');
      expect(res.body.data.password).toBeUndefined();
    });

    test('62. Should fail to get profile without authentication', async () => {
      const res = await request(app)
        .get('/api/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== UPDATE PROFILE ====================

  describe('PUT /api/profile', () => {
    test('63. Should update profile with valid data', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          bio: 'Updated bio',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Updated');
      expect(res.body.data.bio).toBe('Updated bio');
    });

    test('64. Should fail to update profile without authentication', async () => {
      const res = await request(app)
        .put('/api/profile')
        .send({
          firstName: 'Hacked',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('65. Should fail to update email to existing email', async () => {
      // Create another user
      await User.create({
        firstName: 'Another',
        lastName: 'User',
        username: 'anotheruser',
        email: 'another@test.com',
        password: 'password123',
      });

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'another@test.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);

      // Cleanup
      await User.deleteOne({ email: 'another@test.com' });
    });
  });
});