import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  title: string;
  destination: string;
  country: string;
  description: string;
  shortDescription: string;
  duration: {
    days: number;
    nights: number;
  };
  price: {
    amount: number;
    currency: string;
    originalPrice?: number;
  };
  images: string[];
  coverImage: string;
  category: 'beach' | 'adventure' | 'cultural' | 'luxury' | 'budget' | 'family' | 'honeymoon' | 'group';
  includes: string[];
  excludes: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals: string[];
  }>;
  accommodation: {
    hotelName: string;
    hotelRating: number;
    roomType: string;
  };
  highlights: string[];
  availability: {
    startDate: Date;
    endDate: Date;
    maxBookings: number;
    bookedCount: number;
  };
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  isActive: boolean;
  featured: boolean;
  cancellationPolicy: string;
  termsAndConditions: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    title: { 
      type: String, 
      required: [true, 'Package title is required'],
      trim: true 
    },
    destination: { 
      type: String, 
      required: [true, 'Destination is required'] 
    },
    country: { 
      type: String, 
      required: [true, 'Country is required'] 
    },
    description: { 
      type: String, 
      required: [true, 'Description is required'] 
    },
    shortDescription: { 
      type: String, 
      required: [true, 'Short description is required'],
      maxlength: 200 
    },
    duration: {
      days: { type: Number, required: true },
      nights: { type: Number, required: true }
    },
    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      originalPrice: { type: Number }
    },
    images: [{ type: String }],
    coverImage: { 
      type: String, 
      required: [true, 'Cover image is required'] 
    },
    category: {
      type: String,
      enum: ['beach', 'adventure', 'cultural', 'luxury', 'budget', 'family', 'honeymoon', 'group'],
      required: [true, 'Category is required']
    },
    includes: [{ type: String }],
    excludes: [{ type: String }],
    itinerary: [{
      day: { type: Number, required: true },
      title: { type: String, required: true },
      description: { type: String },
      activities: [{ type: String }],
      meals: [{ type: String }]
    }],
    accommodation: {
      hotelName: { type: String },
      hotelRating: { type: Number, min: 1, max: 5 },
      roomType: { type: String }
    },
    highlights: [{ type: String }],
    availability: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      maxBookings: { type: Number, default: 100 },
      bookedCount: { type: Number, default: 0 }
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    tags: [{ type: String }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    featured: { 
      type: Boolean, 
      default: false 
    },
    cancellationPolicy: { type: String },
    termsAndConditions: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// Add index for search
packageSchema.index({ title: 'text', destination: 'text', country: 'text', description: 'text' });

export const Package = mongoose.model<IPackage>('Package', packageSchema);