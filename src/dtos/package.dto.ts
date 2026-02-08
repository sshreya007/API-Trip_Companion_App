export interface CreatePackageDto {
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
    currency?: string;
    originalPrice?: number;
  };
  coverImage: string;
  images?: string[];
  category: 'beach' | 'adventure' | 'cultural' | 'luxury' | 'budget' | 'family' | 'honeymoon' | 'group';
  includes?: string[];
  excludes?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description?: string;
    activities?: string[];
    meals?: string[];
  }>;
  accommodation?: {
    hotelName: string;
    hotelRating: number;
    roomType: string;
  };
  highlights?: string[];
  availability: {
    startDate: Date;
    endDate: Date;
    maxBookings?: number;
  };
  tags?: string[];
  featured?: boolean;
  cancellationPolicy?: string;
  termsAndConditions?: string;
}

export interface UpdatePackageDto {
  title?: string;
  destination?: string;
  country?: string;
  description?: string;
  shortDescription?: string;
  duration?: {
    days: number;
    nights: number;
  };
  price?: {
    amount: number;
    currency?: string;
    originalPrice?: number;
  };
  coverImage?: string;
  images?: string[];
  category?: 'beach' | 'adventure' | 'cultural' | 'luxury' | 'budget' | 'family' | 'honeymoon' | 'group';
  includes?: string[];
  excludes?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description?: string;
    activities?: string[];
    meals?: string[];
  }>;
  accommodation?: {
    hotelName: string;
    hotelRating: number;
    roomType: string;
  };
  highlights?: string[];
  availability?: {
    startDate: Date;
    endDate: Date;
    maxBookings?: number;
  };
  tags?: string[];
  featured?: boolean;
  isActive?: boolean;
  cancellationPolicy?: string;
  termsAndConditions?: string;
}

export interface PackageFilterDto {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minDays?: number;
  maxDays?: number;
  destination?: string;
  country?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'price' | 'rating' | 'duration' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}