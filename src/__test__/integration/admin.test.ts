import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import jwt from 'jsonwebtoken';

describe('Admin API Integration Tests', () => {
  let adminToken: string;
  let adminUserId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: { $in: ['admin@test.com', 'newuser@test.com'] } });

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
    });
    adminUserId = adminUser._id.toString();

    // Generate admin token
    adminToken = jwt.sign(
      { userId: adminUserId, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['admin@test.com', 'newuser@test.com'] } });
  });

  // ==================== GET ALL USERS ====================

  describe('GET /api/admin/users', () => {
    test('16. Should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('17. Should fail to get users without token', async () => {
      const res = await request(app)
        .get('/api/admin/users');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('18. Should fail to get users as non-admin', async () => {
      // Create regular user
      const regularUser = await User.create({
        firstName: 'Regular',
        lastName: 'User',
        username: 'regularuser',
        email: 'regular@test.com',
        password: 'password123',
        role: 'user',
      });

      const userToken = jwt.sign(
        { userId: regularUser._id.toString(), role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1d' }
      );

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      // Cleanup
      await User.deleteOne({ _id: regularUser._id });
    });
  });

  // ==================== CREATE USER ====================

  describe('POST /api/admin/users', () => {
    test('19. Should create new user as admin', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'New',
          lastName: 'User',
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'user',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('newuser@test.com');
      
      testUserId = res.body.data._id;
    });

    test('20. Should fail to create user with duplicate email', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Another',
          lastName: 'User',
          username: 'anotheruser',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'user',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== UPDATE USER ====================

  describe('PUT /api/admin/users/:id', () => {
    test('21. Should update user as admin', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Updated');
    });

    test('22. Should fail to update non-existent user', async () => {
      const res = await request(app)
        .put('/api/admin/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Test',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== DELETE USER ====================

  describe('DELETE /api/admin/users/:id', () => {
    test('23. Should delete user as admin', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('24. Should fail to delete non-existent user', async () => {
      const res = await request(app)
        .delete('/api/admin/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== GET USER BY ID ====================

  describe('GET /api/admin/users/:id', () => {
    test('25. Should get user by ID as admin', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@test.com');
    });
  });
});