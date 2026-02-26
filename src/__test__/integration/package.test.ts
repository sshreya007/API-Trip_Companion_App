import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Package } from '../../models/package.model';
import jwt from 'jsonwebtoken';

describe('Package API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let testPackageId: string;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: { $in: ['pkgadmin@test.com', 'pkguser@test.com'] } });
    await Package.deleteMany({});

    // Create admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      username: 'pkgadmin',
      email: 'pkgadmin@test.com',
      password: 'admin123',
      role: 'admin',
    });

    adminToken = jwt.sign(
      { userId: admin._id.toString(), role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1d' }
    );

    // Create regular user
    const user = await User.create({
      firstName: 'User',
      lastName: 'Test',
      username: 'pkguser',
      email: 'pkguser@test.com',
      password: 'user123',
      role: 'user',
    });

    userToken = jwt.sign(
      { userId: user._id.toString(), role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['pkgadmin@test.com', 'pkguser@test.com'] } });
    await Package.deleteMany({});
  });

  const testPackageData = {
    title: 'Test Beach Package',
    destination: 'Bali',
    country: 'Indonesia',
    description: 'Beautiful beach vacation',
    shortDescription: '5-day beach getaway',
    duration: { days: 5, nights: 4 },
    price: { amount: 999, currency: 'USD' },
    coverImage: '/uploads/test.jpg',
    category: 'beach',
    includes: ['Flight', 'Hotel', 'Breakfast'],
    excludes: ['Lunch', 'Dinner'],
    highlights: ['Beach access', 'Spa'],
    availability: {
      startDate: '2026-03-01',
      endDate: '2026-12-31',
      maxBookings: 100,
    },
    tags: ['beach', 'relaxing'],
  };

  // ==================== CREATE PACKAGE ====================

  describe('POST /api/packages', () => {
    test('26. Should create package as admin', async () => {
      const res = await request(app)
        .post('/api/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testPackageData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testPackageData.title);
      
      testPackageId = res.body.data._id;
    });

    test('27. Should fail to create package without auth', async () => {
      const res = await request(app)
        .post('/api/packages')
        .send(testPackageData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('28. Should fail to create package as non-admin', async () => {
      const res = await request(app)
        .post('/api/packages')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testPackageData);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('29. Should fail to create package with missing required fields', async () => {
      const res = await request(app)
        .post('/api/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Incomplete Package',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== GET ALL PACKAGES ====================

  describe('GET /api/packages', () => {
    test('30. Should get all packages (public)', async () => {
      const res = await request(app)
        .get('/api/packages');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('31. Should filter packages by category', async () => {
      const res = await request(app)
        .get('/api/packages?category=beach');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].category).toBe('beach');
    });

    test('32. Should filter packages by price range', async () => {
      const res = await request(app)
        .get('/api/packages?minPrice=500&maxPrice=1500');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('33. Should search packages by destination', async () => {
      const res = await request(app)
        .get('/api/packages?search=Bali');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('34. Should sort packages by price', async () => {
      const res = await request(app)
        .get('/api/packages?sortBy=price&sortOrder=asc');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== GET PACKAGE BY ID ====================

  describe('GET /api/packages/:id', () => {
    test('35. Should get package by ID', async () => {
      const res = await request(app)
        .get(`/api/packages/${testPackageId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testPackageData.title);
    });

    test('36. Should fail to get non-existent package', async () => {
      const res = await request(app)
        .get('/api/packages/507f1f77bcf86cd799439011');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== UPDATE PACKAGE ====================

  describe('PUT /api/packages/:id', () => {
    test('37. Should update package as admin', async () => {
      const res = await request(app)
        .put(`/api/packages/${testPackageId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Beach Package',
          price: { amount: 1099, currency: 'USD' },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Beach Package');
    });

    test('38. Should fail to update package as non-admin', async () => {
      const res = await request(app)
        .put(`/api/packages/${testPackageId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Hacked Package',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== TOGGLE PACKAGE STATUS ====================

  describe('PATCH /api/packages/:id/toggle-status', () => {
    test('39. Should toggle package status as admin', async () => {
      const res = await request(app)
        .patch(`/api/packages/${testPackageId}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== DELETE PACKAGE ====================

  describe('DELETE /api/packages/:id', () => {
    test('40. Should delete package as admin', async () => {
      const res = await request(app)
        .delete(`/api/packages/${testPackageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});