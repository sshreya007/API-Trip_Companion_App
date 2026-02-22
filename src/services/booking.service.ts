import { BookingRepository } from '../repositories/booking.repository';
import { PackageRepository } from '../repositories/package.repository';
import { CreateBookingDto, UpdateBookingDto, AddReviewDto, BookingFilterDto } from '../dtos/booking.dto';
import { HttpError } from '../errors/http-error';

export class BookingService {
  private bookingRepository: BookingRepository;
  private packageRepository: PackageRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.packageRepository = new PackageRepository();
  }

  // Create booking
  async createBooking(bookingData: CreateBookingDto, userId: string) {
    try {
      console.log('📝 BookingService: Starting booking creation');
      console.log('📦 Package ID:', bookingData.packageId);
      console.log('👤 User ID:', userId);

      // Check if package exists
      const pkg = await this.packageRepository.getPackageById(bookingData.packageId);
      if (!pkg) {
        console.error('❌ Package not found:', bookingData.packageId);
        throw new HttpError(404, 'Package not found');
      }

      console.log('✅ Package found:', pkg.title);

      // Check if package is active
      if (!pkg.isActive) {
        console.error('❌ Package is not active');
        throw new HttpError(400, 'This package is currently unavailable');
      }

      console.log('✅ Package is active');

      // Check availability
      const isAvailable = await this.packageRepository.checkAvailability(bookingData.packageId);
      if (!isAvailable) {
        console.error('❌ Package is fully booked');
        throw new HttpError(400, 'Package is fully booked');
      }

      console.log('✅ Package has availability');

      // Validate travel date
      const travelDate = new Date(bookingData.travelDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log('📅 Travel date:', travelDate);
      console.log('📅 Today:', today);

      if (travelDate < today) {
        console.error('❌ Travel date is in the past');
        throw new HttpError(400, 'Travel date cannot be in the past');
      }

      if (travelDate < new Date(pkg.availability.startDate) || travelDate > new Date(pkg.availability.endDate)) {
        console.error('❌ Travel date outside availability range');
        throw new HttpError(400, 'Travel date is outside package availability range');
      }

      console.log('✅ Travel date is valid');

      // Calculate total price
      const basePrice = pkg.price.amount;
      let totalPrice = basePrice * bookingData.numberOfTravelers.adults;
      
      // Children typically get 50% discount
      totalPrice += (basePrice * 0.5) * bookingData.numberOfTravelers.children;

      // Add add-ons
      if (bookingData.addOns && bookingData.addOns.length > 0) {
        const addOnsTotal = bookingData.addOns.reduce((sum, addon) => sum + addon.price, 0);
        totalPrice += addOnsTotal;
      }

      // Apply discount if any
      if (bookingData.discountCode) {
        const discountAmount = totalPrice * 0.1;
        totalPrice -= discountAmount;
      }

      console.log('💰 Total price:', totalPrice);

      // Create booking
      console.log('💾 Creating booking in repository...');
      const booking = await this.bookingRepository.createBooking(bookingData, userId, totalPrice);

      console.log('✅ Booking created:', booking.bookingReference);

      // Increment booked count
      await this.packageRepository.incrementBookedCount(bookingData.packageId);

      console.log('✅ Booking process completed successfully');

      return booking;
    } catch (error: any) {
      console.error('❌ BookingService Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error instanceof HttpError) throw error;
      
      // ✅ FIX: Pass the actual error message instead of generic one
      throw new HttpError(500, `Failed to create booking: ${error.message}`);
    }
  }

  // Get user bookings
  async getUserBookings(userId: string, filters: BookingFilterDto) {
    try {
      return await this.bookingRepository.getUserBookings(userId, filters);
    } catch (error: any) {
      console.error('❌ Get user bookings error:', error);
      throw new HttpError(500, `Failed to fetch bookings: ${error.message}`);
    }
  }

  // Get all bookings (Admin)
  async getAllBookings(filters: BookingFilterDto) {
    try {
      return await this.bookingRepository.getAllBookings(filters);
    } catch (error: any) {
      console.error('❌ Get all bookings error:', error);
      throw new HttpError(500, `Failed to fetch bookings: ${error.message}`);
    }
  }

  // Get booking by ID
  async getBookingById(id: string, userId: string, isAdmin: boolean = false) {
    try {
      const booking = await this.bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, 'Booking not found');
      }

      // Check if user owns the booking (unless admin)
      if (!isAdmin && booking.userId.toString() !== userId) {
        throw new HttpError(403, 'You do not have permission to view this booking');
      }

      return booking;
    } catch (error: any) {
      console.error('❌ Get booking by ID error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, `Failed to fetch booking: ${error.message}`);
    }
  }

  // Get booking by reference
  async getBookingByReference(reference: string) {
    try {
      const booking = await this.bookingRepository.getBookingByReference(reference);
      if (!booking) {
        throw new HttpError(404, 'Booking not found');
      }
      return booking;
    } catch (error: any) {
      console.error('❌ Get booking by reference error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, `Failed to fetch booking: ${error.message}`);
    }
  }

  // Update booking
  async updateBooking(id: string, updateData: UpdateBookingDto, userId: string) {
    try {
      const booking = await this.bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, 'Booking not found');
      }

      // Check ownership
      if (booking.userId.toString() !== userId) {
        throw new HttpError(403, 'You do not have permission to update this booking');
      }

      // Can only update if status is pending
      if (booking.status !== 'pending') {
        throw new HttpError(400, 'Can only update pending bookings');
      }

      const updatedBooking = await this.bookingRepository.updateBooking(id, updateData);
      return updatedBooking;
    } catch (error: any) {
      console.error('❌ Update booking error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, `Failed to update booking: ${error.message}`);
    }
  }

  // Cancel booking
  async cancelBooking(id: string, reason: string, userId: string, isAdmin: boolean = false) {
    try {
      const booking = await this.bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, 'Booking not found');
      }

      // Check ownership (unless admin)
      if (!isAdmin && booking.userId.toString() !== userId) {
        throw new HttpError(403, 'You do not have permission to cancel this booking');
      }

      // Cannot cancel if already cancelled or completed
      if (booking.status === 'cancelled') {
        throw new HttpError(400, 'Booking is already cancelled');
      }
      if (booking.status === 'completed') {
        throw new HttpError(400, 'Cannot cancel completed booking');
      }

      const cancelledBooking = await this.bookingRepository.cancelBooking(id, reason);
      return cancelledBooking;
    } catch (error: any) {
      console.error('❌ Cancel booking error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, `Failed to cancel booking: ${error.message}`);
    }
  }

  // Confirm booking (Admin only)
  async confirmBooking(id: string) {
    try {
      const booking = await this.bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, 'Booking not found');
      }

      if (booking.status !== 'pending') {
        throw new HttpError(400, 'Only pending bookings can be confirmed');
      }

      const confirmedBooking = await this.bookingRepository.confirmBooking(id);
      return confirmedBooking;
    } catch (error: any) {
      console.error('❌ Confirm booking error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, `Failed to confirm booking: ${error.message}`);
    }
  }

  // Complete booking (Admin only or automatic after travel date)
  async completeBooking(id: string) {
    try {
      const booking = await this.bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, 'Booking not found');
      }

      if (booking.status !== 'confirmed') {
        throw new HttpError(400, 'Only confirmed bookings can be completed');
      }

      const completedBooking = await this.bookingRepository.completeBooking(id);
      return completedBooking;
    } catch (error: any) {
      console.error('❌ Complete booking error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, `Failed to complete booking: ${error.message}`);
    }
  }

  // Add review
  async addReview(id: string, reviewData: AddReviewDto, userId: string) {
    try {
      const booking = await this.bookingRepository.getBookingById(id);
      if (!booking) {
        throw new HttpError(404, 'Booking not found');
      }

      // Check ownership
      if (booking.userId.toString() !== userId) {
        throw new HttpError(403, 'You do not have permission to review this booking');
      }

      // Can only review completed bookings
      if (booking.status !== 'completed') {
        throw new HttpError(400, 'Can only review completed bookings');
      }

      // Check if already reviewed
      if (booking.review) {
        throw new HttpError(400, 'Booking already has a review');
      }

      // Validate rating
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new HttpError(400, 'Rating must be between 1 and 5');
      }

      const updatedBooking = await this.bookingRepository.addReview(id, reviewData.rating, reviewData.comment);

      // Update package rating
      if (booking.packageId) {
        await this.packageRepository.updateRating(booking.packageId.toString(), reviewData.rating);
      }

      return updatedBooking;
    } catch (error: any) {
      console.error('❌ Add review error:', error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, `Failed to add review: ${error.message}`);
    }
  }

  // Get booking statistics
  async getBookingStats(userId: string) {
    try {
      return await this.bookingRepository.getBookingStats(userId);
    } catch (error: any) {
      console.error('❌ Get booking stats error:', error);
      throw new HttpError(500, `Failed to fetch booking statistics: ${error.message}`);
    }
  }
}