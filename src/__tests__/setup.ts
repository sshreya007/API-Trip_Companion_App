import { connectDB } from '../database/mongodb';
import mongoose from 'mongoose';

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