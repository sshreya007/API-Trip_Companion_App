import { Package, IPackage } from '../models/package.model';
import { CreatePackageDto, UpdatePackageDto, PackageFilterDto } from '../dtos/package.dto';

export class PackageRepository {
  // Create package
  async createPackage(packageData: CreatePackageDto, adminId: string): Promise<IPackage> {
    const newPackage = new Package({
      ...packageData,
      createdBy: adminId
    });
    return await newPackage.save();
  }

  // Get all packages with filters
  async getAllPackages(filters: PackageFilterDto) {
    const {
      category,
      minPrice,
      maxPrice,
      minDays,
      maxDays,
      destination,
      country,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters;

    const query: any = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = minPrice;
      if (maxPrice) query['price.amount'].$lte = maxPrice;
    }
    if (minDays || maxDays) {
      query['duration.days'] = {};
      if (minDays) query['duration.days'].$gte = minDays;
      if (maxDays) query['duration.days'].$lte = maxDays;
    }
    if (destination) query.destination = new RegExp(destination, 'i');
    if (country) query.country = new RegExp(country, 'i');
    if (featured !== undefined) query.featured = featured;
    if (search) query.$text = { $search: search };

    // Sorting
    const sortOptions: any = {};
    if (sortBy === 'price') {
      sortOptions['price.amount'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortOptions['rating.average'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'duration') {
      sortOptions['duration.days'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * limit;

    const packages = await Package.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');

    const total = await Package.countDocuments(query);

    return {
      packages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get package by ID
  async getPackageById(id: string): Promise<IPackage | null> {
    return await Package.findById(id).populate('createdBy', 'firstName lastName email');
  }

  // Get featured packages
  async getFeaturedPackages(limit: number = 6): Promise<IPackage[]> {
    return await Package.find({ isActive: true, featured: true })
      .limit(limit)
      .sort({ 'rating.average': -1 });
  }

  // Get packages by category
  async getPackagesByCategory(category: string, limit: number = 10): Promise<IPackage[]> {
    return await Package.find({ isActive: true, category })
      .limit(limit)
      .sort({ 'rating.average': -1 });
  }

  // Update package
  async updatePackage(id: string, updateData: UpdatePackageDto): Promise<IPackage | null> {
    return await Package.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  // Delete package
  async deletePackage(id: string): Promise<IPackage | null> {
    return await Package.findByIdAndDelete(id);
  }

  // Toggle package active status
  async toggleActiveStatus(id: string): Promise<IPackage | null> {
    const pkg = await Package.findById(id);
    if (!pkg) return null;
    
    pkg.isActive = !pkg.isActive;
    return await pkg.save();
  }

  // Update package rating
  async updateRating(packageId: string, newRating: number): Promise<void> {
    const pkg = await Package.findById(packageId);
    if (!pkg) return;

    const totalRating = pkg.rating.average * pkg.rating.count;
    pkg.rating.count += 1;
    pkg.rating.average = (totalRating + newRating) / pkg.rating.count;

    await pkg.save();
  }

  // Increment booked count
  async incrementBookedCount(packageId: string): Promise<void> {
    await Package.findByIdAndUpdate(packageId, {
      $inc: { 'availability.bookedCount': 1 }
    });
  }

  // Check availability
  async checkAvailability(packageId: string): Promise<boolean> {
    const pkg = await Package.findById(packageId);
    if (!pkg) return false;

    return pkg.availability.bookedCount < pkg.availability.maxBookings;
  }
}