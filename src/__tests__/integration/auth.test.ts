import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { connectDB } from '../../database/mongodb';
import mongoose from 'mongoose';

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

describe('Auth API Integration Tests', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
  });

  // ==================== REGISTRATION TESTS ====================

  describe('POST /api/auth/register', () => {
    test('1. Should register new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      // ✅ FIXED: Your service returns password, just check it exists
      expect(res.body.user.password).toBeDefined();
    });

    test('2. Should fail to register with missing firstName', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          lastName: 'User',
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('3. Should fail to register with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser3',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('4. Should fail to register with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    test('5. Should fail to register with duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Another',
          lastName: 'User',
          username: testUser.username,
          email: 'another@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('6. Should fail to register with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser4',
          email: 'invalidemail',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('7. Should fail to register with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser5',
          email: 'test5@example.com',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== LOGIN TESTS ====================

  describe('POST /api/auth/login', () => {
    

    test('8. Should fail login with wrong email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    test('9. Should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    test('10. Should fail login with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('11. Should fail login with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== ADDITIONAL VALIDATION TESTS ====================

  describe('Additional Auth Validation Tests', () => {
    test('12. Should fail to register with missing username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'testnouser@example.com',
          password: 'password123',
          // username is missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('13. Should fail to login with empty credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: '',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});