import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  bookingReference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  specialRequests?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  addOns: Array<{
    name: string;
    price: number;
  }>;
  discount: {
    code?: string;
    amount: number;
  };
  bookingDate: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  review?: {
    rating: number;
    comment: string;
    reviewDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    travelers: [{
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other'],
        required: true 
      },
      passportNumber: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    }],
    travelDate: {
      type: Date,
      required: true
    },
    numberOfTravelers: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 }
    },
    totalPrice: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentMethod: { type: String },
    specialRequests: { type: String },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String, required: true }
    },
    addOns: [{
      name: { type: String },
      price: { type: Number }
    }],
    discount: {
      code: { type: String },
      amount: { type: Number, default: 0 }
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    cancellationDate: { type: Date },
    cancellationReason: { type: String },
    refundAmount: { type: Number },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      reviewDate: { type: Date }
    }
  },
  { 
    timestamps: true 
  }
);

// ✅ FIXED: Generate unique booking reference before saving
bookingSchema.pre('save', async function() {
  if (this.isNew && !this.bookingReference) {
    this.bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  
});

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);