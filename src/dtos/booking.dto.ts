export interface CreateBookingDto {
  packageId: string;
  travelers: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    passportNumber?: string;
    email: string;
    phone: string;
  }>;
  travelDate: Date;
  numberOfTravelers: {
    adults: number;
    children: number;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  specialRequests?: string;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
  discountCode?: string;
  paymentMethod?: string;
}

export interface UpdateBookingDto {
  travelers?: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    passportNumber?: string;
    email: string;
    phone: string;
  }>;
  travelDate?: Date;
  numberOfTravelers?: {
    adults: number;
    children: number;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  specialRequests?: string;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
}

export interface AddReviewDto {
  rating: number;
  comment: string;
}

export interface BookingFilterDto {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'bookingDate' | 'travelDate' | 'totalPrice';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}