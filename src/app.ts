import express from "express";
import cors from "cors";
import path from 'path';
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import adminRoutes from './routes/admin.route';
import packageRoutes from './routes/package.route';
import bookingRoutes from './routes/booking.route';
import passwordResetRoutes from './routes/password-reset.route';
import { errorHandler } from './errors/error-handler';

const app = express();

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;