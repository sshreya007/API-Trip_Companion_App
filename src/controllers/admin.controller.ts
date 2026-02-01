import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { HttpError } from '../errors/http-error';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imagePath = req.file ? req.file.path : undefined;
      const user = await this.adminService.createUser(req.body, imagePath);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.adminService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      
      if (!id || Array.isArray(id)) {
        throw new HttpError(400, 'Invalid user ID');
      }

      const user = await this.adminService.getUserById(id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      
      if (!id || Array.isArray(id)) {
        throw new HttpError(400, 'Invalid user ID');
      }

      const imagePath = req.file ? req.file.path : undefined;
      const user = await this.adminService.updateUser(id, req.body, imagePath);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      
      if (!id || Array.isArray(id)) {
        throw new HttpError(400, 'Invalid user ID');
      }

      await this.adminService.deleteUser(id);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}