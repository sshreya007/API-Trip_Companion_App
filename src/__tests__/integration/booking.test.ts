import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user.model';
import { Package } from '../../models/package.model';
import { Booking } from '../../models/booking.model';
import jwt from 'jsonwebtoken';

describe('Booking API Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let adminToken: string;
  let packageId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: { $in: ['bookuser@test.com', 'bookadmin@test.com'] } });
    await Package.deleteMany({});
    await Booking.deleteMany({});

    // Create regular user
    const user = await User.create({
      firstName: 'Booking',
      lastName: 'User',
      username: 'bookuser',
      email: 'bookuser@test.com',
      password: 'password123',
      role: 'user',
    });
    userId = user._id.toString();

    userToken = jwt.sign(
      { userId: userId, role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1d' }
    );

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      username: 'bookadmin',
      email: 'bookadmin@test.com',
      password: 'admin123',
      role: 'admin',
    });

    adminToken = jwt.sign(
      { userId: admin._id.toString(), role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1d' }
    );

    // Create test package
    const pkg = await Package.create({
      title: 'Booking Test Package',
      destination: 'Test City',
      country: 'Test Country',
      description: 'Test description',
      shortDescription: 'Test short description',
      duration: { days: 5, nights: 4 },
      price: { amount: 999, currency: 'USD' },
      coverImage: '/uploads/test.jpg',
      category: 'beach',
      includes: ['Flight', 'Hotel'],
      excludes: ['Insurance'],
      itinerary: [],
      accommodation: {
        hotelName: 'Test Hotel',
        hotelRating: 5,
        roomType: 'Deluxe',
      },
      highlights: ['Test highlight'],
      availability: {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-12-31'),
        maxBookings: 100,
        bookedCount: 0,
      },
      rating: { average: 4.5, count: 10 },
      tags: ['test'],
      isActive: true,
      featured: false,
      cancellationPolicy: 'Test policy',
      termsAndConditions: 'Test terms',
      createdBy: admin._id.toString(),
    });
    packageId = pkg._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['bookuser@test.com', 'bookadmin@test.com'] } });
    await Package.deleteMany({});
    await Booking.deleteMany({});
  });

  const bookingData = {
    packageId: '',
    travelDate: '2026-06-15',
    numberOfTravelers: {
      adults: 2,
      children: 0,
    },
    travelers: [
      {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        gender: 'Male',
        email: 'john@example.com',
        phone: '+1234567890',
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        age: 28,
        gender: 'Female',
        email: 'jane@example.com',
        phone: '+1234567890',
      },
    ],
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+1234567890',
      relation: 'Spouse',
    },
    specialRequests: 'Window seats please',
  };

  // ==================== CREATE BOOKING ====================

  describe('POST /api/bookings', () => {
    test('41. Should create booking with valid data', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...bookingData,
          packageId: packageId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingReference).toBeDefined();
      expect(res.body.data.status).toBe('pending');
      
      bookingId = res.body.data._id;
    });

    test('42. Should fail to create booking without authentication', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          ...bookingData,
          packageId: packageId,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('43. Should fail to create booking with invalid package ID', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...bookingData,
          packageId: '507f1f77bcf86cd799439011',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('44. Should fail to create booking with past travel date', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...bookingData,
          packageId: packageId,
          travelDate: '2020-01-01',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    

    
  });

  // ==================== GET USER BOOKINGS ====================

  describe('GET /api/bookings', () => {
    test('47. Should get user bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('48. Should filter bookings by status', async () => {
      const res = await request(app)
        .get('/api/bookings?status=pending')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((b: any) => b.status === 'pending')).toBe(true);
    });

    test('49. Should fail to get bookings without authentication', async () => {
      const res = await request(app)
        .get('/api/bookings');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==================== GET BOOKING BY ID ====================

  describe('GET /api/bookings/:id', () => {
    

    test('51. Should fail to get another user\'s booking', async () => {
      // Create another user
      const anotherUser = await User.create({
        firstName: 'Another',
        lastName: 'User',
        username: 'anotheruser',
        email: 'another@test.com',
        password: 'password123',
        role: 'user',
      });

      const anotherToken = jwt.sign(
        { userId: anotherUser._id.toString(), role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1d' }
      );

      const res = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      // Cleanup
      await User.deleteOne({ _id: anotherUser._id });
    });
  });

  // ==================== ADMIN GET ALL BOOKINGS ====================

  describe('GET /api/bookings/admin/all', () => {
    test('52. Should get all bookings as admin', async () => {
      const res = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('53. Should fail to get all bookings as non-admin', async () => {
      const res = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  
});