import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto, UpdateBookingDto, AddReviewDto, BookingFilterDto } from '../dtos/booking.dto';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  // Create booking
  // createBooking = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId = req.user?.id as string; // ✅ FIXED
  //     const bookingData: CreateBookingDto = req.body;

  //     const booking = await this.bookingService.createBooking(bookingData, userId);

  //     res.status(201).json({
  //       success: true,
  //       message: 'Booking created successfully',
  //       data: booking
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  // Create booking
createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const bookingData: CreateBookingDto = req.body;

    console.log('📝 Received booking data:', JSON.stringify(bookingData, null, 2));
    console.log('👤 User ID:', userId);

    const booking = await this.bookingService.createBooking(bookingData, userId);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error: any) {
    console.error('❌ Booking creation error:', error);
    next(error);
  }
};

  // Get user bookings
  getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string; // ✅ FIXED
      const filters: BookingFilterDto = {
        status: req.query.status as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
      };

      const result = await this.bookingService.getUserBookings(userId, filters);

      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all bookings (Admin)
  getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: BookingFilterDto = {
        status: req.query.status as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
      };

      const result = await this.bookingService.getAllBookings(filters);

      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // Get booking by ID
  getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const userId = req.user?.id as string; // ✅ FIXED
      const isAdmin = req.user?.role === 'admin';

      const booking = await this.bookingService.getBookingById(id, userId, isAdmin);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Get booking by reference
  getBookingByReference = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reference = req.params.reference as string; // ✅ FIXED
      const booking = await this.bookingService.getBookingByReference(reference);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Update booking
  updateBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const userId = req.user?.id as string; // ✅ FIXED
      const updateData: UpdateBookingDto = req.body;

      const booking = await this.bookingService.updateBooking(id, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Cancel booking
  cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const userId = req.user?.id as string; // ✅ FIXED
      const isAdmin = req.user?.role === 'admin';
      const { reason } = req.body;

      const booking = await this.bookingService.cancelBooking(id, reason, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Confirm booking (Admin)
  confirmBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const booking = await this.bookingService.confirmBooking(id);

      res.status(200).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Complete booking (Admin)
  completeBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const booking = await this.bookingService.completeBooking(id);

      res.status(200).json({
        success: true,
        message: 'Booking completed successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Add review
  addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const userId = req.user?.id as string; // ✅ FIXED
      const reviewData: AddReviewDto = req.body;

      const booking = await this.bookingService.addReview(id, reviewData, userId);

      res.status(200).json({
        success: true,
        message: 'Review added successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Get booking statistics
  getBookingStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string; // ✅ FIXED
      const stats = await this.bookingService.getBookingStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}