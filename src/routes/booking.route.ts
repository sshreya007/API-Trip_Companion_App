import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();
const bookingController = new BookingController();

// User routes (authenticated)
router.post('/', authenticate, bookingController.createBooking);
router.get('/', authenticate, bookingController.getUserBookings);
router.get('/stats', authenticate, bookingController.getBookingStats);
router.get('/:id', authenticate, bookingController.getBookingById);
router.get('/reference/:reference', authenticate, bookingController.getBookingByReference);
router.put('/:id', authenticate, bookingController.updateBooking);
router.delete('/:id', authenticate, bookingController.cancelBooking);
router.post('/:id/review', authenticate, bookingController.addReview);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, bookingController.getAllBookings);
router.patch('/:id/confirm', authenticate, isAdmin, bookingController.confirmBooking);
router.patch('/:id/complete', authenticate, isAdmin, bookingController.completeBooking);

export default router;