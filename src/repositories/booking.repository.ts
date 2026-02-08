import { Booking, IBooking } from '../models/booking.model';
import { CreateBookingDto, UpdateBookingDto, BookingFilterDto } from '../dtos/booking.dto';

export class BookingRepository {
  // Create booking
  async createBooking(bookingData: CreateBookingDto, userId: string, totalPrice: number): Promise<IBooking> {
    const newBooking = new Booking({
      ...bookingData,
      userId,
      totalPrice
    });
    return await newBooking.save();
  }

  // Get all bookings for a user
  async getUserBookings(userId: string, filters: BookingFilterDto) {
    const {
      status,
      startDate,
      endDate,
      sortBy = 'bookingDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters;

    const query: any = { userId };

    if (status) query.status = status;
    if (startDate || endDate) {
      query.travelDate = {};
      if (startDate) query.travelDate.$gte = startDate;
      if (endDate) query.travelDate.$lte = endDate;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('packageId')
      .populate('userId', 'firstName lastName email');

    const total = await Booking.countDocuments(query);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get all bookings (admin)
  async getAllBookings(filters: BookingFilterDto) {
    const {
      status,
      startDate,
      endDate,
      sortBy = 'bookingDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters;

    const query: any = {};

    if (status) query.status = status;
    if (startDate || endDate) {
      query.travelDate = {};
      if (startDate) query.travelDate.$gte = startDate;
      if (endDate) query.travelDate.$lte = endDate;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('packageId')
      .populate('userId', 'firstName lastName email');

    const total = await Booking.countDocuments(query);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<IBooking | null> {
    return await Booking.findById(id)
      .populate('packageId')
      .populate('userId', 'firstName lastName email');
  }

  // Get booking by reference
  async getBookingByReference(reference: string): Promise<IBooking | null> {
    return await Booking.findOne({ bookingReference: reference })
      .populate('packageId')
      .populate('userId', 'firstName lastName email');
  }

  // Update booking
  async updateBooking(id: string, updateData: UpdateBookingDto): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('packageId');
  }

  // Cancel booking
  async cancelBooking(id: string, reason: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'cancelled',
          cancellationDate: new Date(),
          cancellationReason: reason
        }
      },
      { new: true }
    ).populate('packageId');
  }

  // Confirm booking
  async confirmBooking(id: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { $set: { status: 'confirmed', paymentStatus: 'paid' } },
      { new: true }
    ).populate('packageId');
  }

  // Complete booking
  async completeBooking(id: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { $set: { status: 'completed' } },
      { new: true }
    ).populate('packageId');
  }

  // Add review
  async addReview(id: string, rating: number, comment: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          review: {
            rating,
            comment,
            reviewDate: new Date()
          }
        }
      },
      { new: true }
    ).populate('packageId');
  }

  // Get booking statistics
  async getBookingStats(userId: string) {
    const totalBookings = await Booking.countDocuments({ userId });
    const confirmedBookings = await Booking.countDocuments({ userId, status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ userId, status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ userId, status: 'cancelled' });

    const totalSpent = await Booking.aggregate([
      { $match: { userId: userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    return {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalSpent: totalSpent[0]?.total || 0
    };
  }
}