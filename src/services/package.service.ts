import { PackageRepository } from '../repositories/package.repository';
import { CreatePackageDto, UpdatePackageDto, PackageFilterDto } from '../dtos/package.dto';
import { HttpError } from '../errors/http-error';

export class PackageService {
  private packageRepository: PackageRepository;

  constructor() {
    this.packageRepository = new PackageRepository();
  }

  // Create package (Admin only)
  async createPackage(packageData: CreatePackageDto, adminId: string) {
    try {
      // Validate dates
      if (new Date(packageData.availability.startDate) >= new Date(packageData.availability.endDate)) {
        throw new HttpError(400, 'End date must be after start date');
      }

      const newPackage = await this.packageRepository.createPackage(packageData, adminId);
      return newPackage;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, 'Failed to create package');
    }
  }

  // Get all packages with filters
  async getAllPackages(filters: PackageFilterDto) {
    try {
      const result = await this.packageRepository.getAllPackages(filters);
      return result;
    } catch (error) {
      throw new HttpError(500, 'Failed to fetch packages');
    }
  }

  // Get package by ID
  async getPackageById(id: string) {
    try {
      const pkg = await this.packageRepository.getPackageById(id);
      if (!pkg) {
        throw new HttpError(404, 'Package not found');
      }
      return pkg;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, 'Failed to fetch package');
    }
  }

  // Get featured packages
  async getFeaturedPackages(limit: number = 6) {
    try {
      return await this.packageRepository.getFeaturedPackages(limit);
    } catch (error) {
      throw new HttpError(500, 'Failed to fetch featured packages');
    }
  }

  // Get packages by category
  async getPackagesByCategory(category: string, limit: number = 10) {
    try {
      return await this.packageRepository.getPackagesByCategory(category, limit);
    } catch (error) {
      throw new HttpError(500, 'Failed to fetch packages by category');
    }
  }

  // Update package (Admin only)
  async updatePackage(id: string, updateData: UpdatePackageDto) {
    try {
      const pkg = await this.packageRepository.getPackageById(id);
      if (!pkg) {
        throw new HttpError(404, 'Package not found');
      }

      // Validate dates if provided
      if (updateData.availability) {
        if (new Date(updateData.availability.startDate) >= new Date(updateData.availability.endDate)) {
          throw new HttpError(400, 'End date must be after start date');
        }
      }

      const updatedPackage = await this.packageRepository.updatePackage(id, updateData);
      return updatedPackage;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, 'Failed to update package');
    }
  }

  // Delete package (Admin only)
  async deletePackage(id: string) {
    try {
      const pkg = await this.packageRepository.getPackageById(id);
      if (!pkg) {
        throw new HttpError(404, 'Package not found');
      }

      await this.packageRepository.deletePackage(id);
      return { message: 'Package deleted successfully' };
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, 'Failed to delete package');
    }
  }

  // Toggle package active status (Admin only)
  async toggleActiveStatus(id: string) {
    try {
      const pkg = await this.packageRepository.toggleActiveStatus(id);
      if (!pkg) {
        throw new HttpError(404, 'Package not found');
      }
      return pkg;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, 'Failed to update package status');
    }
  }

  // Check availability
  async checkAvailability(packageId: string) {
    try {
      const isAvailable = await this.packageRepository.checkAvailability(packageId);
      return { available: isAvailable };
    } catch (error) {
      throw new HttpError(500, 'Failed to check availability');
    }
  }
}