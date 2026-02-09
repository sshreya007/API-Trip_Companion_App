import { Request, Response, NextFunction } from 'express';
import { PackageService } from '../services/package.service';
import { CreatePackageDto, UpdatePackageDto, PackageFilterDto } from '../dtos/package.dto';

export class PackageController {
  private packageService: PackageService;

  constructor() {
    this.packageService = new PackageService();
  }

  // Create package (Admin)
  createPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      const packageData: CreatePackageDto = req.body;

      // Handle image upload
      const coverImage = req.file ? req.file.path : packageData.coverImage;
      packageData.coverImage = coverImage;

      const newPackage = await this.packageService.createPackage(packageData, adminId!);

      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: newPackage
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all packages (Public)
  getAllPackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: PackageFilterDto = {
        category: req.query.category as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minDays: req.query.minDays ? Number(req.query.minDays) : undefined,
        maxDays: req.query.maxDays ? Number(req.query.maxDays) : undefined,
        destination: req.query.destination as string,
        country: req.query.country as string,
        featured: req.query.featured === 'true',
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
      };

      const result = await this.packageService.getAllPackages(filters);

      res.status(200).json({
        success: true,
        data: result.packages,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // Get package by ID (Public)
  getPackageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const pkg = await this.packageService.getPackageById(id);

      res.status(200).json({
        success: true,
        data: pkg
      });
    } catch (error) {
      next(error);
    }
  };

  // Get featured packages (Public)
  getFeaturedPackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const packages = await this.packageService.getFeaturedPackages(limit);

      res.status(200).json({
        success: true,
        data: packages
      });
    } catch (error) {
      next(error);
    }
  };

  // Get packages by category (Public)
  getPackagesByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.params.category as string; // ✅ FIXED
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const packages = await this.packageService.getPackagesByCategory(category, limit);

      res.status(200).json({
        success: true,
        data: packages
      });
    } catch (error) {
      next(error);
    }
  };

  // Update package (Admin)
  updatePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const updateData: UpdatePackageDto = req.body;

      // Handle image upload
      if (req.file) {
        updateData.coverImage = req.file.path;
      }

      const updatedPackage = await this.packageService.updatePackage(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Package updated successfully',
        data: updatedPackage
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete package (Admin)
  deletePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      await this.packageService.deletePackage(id);

      res.status(200).json({
        success: true,
        message: 'Package deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Toggle package active status (Admin)
  toggleActiveStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const pkg = await this.packageService.toggleActiveStatus(id);

      res.status(200).json({
        success: true,
        message: `Package ${pkg.isActive ? 'activated' : 'deactivated'} successfully`,
        data: pkg
      });
    } catch (error) {
      next(error);
    }
  };

  // Check availability (Public)
  checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // ✅ FIXED
      const result = await this.packageService.checkAvailability(id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}