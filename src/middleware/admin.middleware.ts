import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user exists on request (should be set by auth middleware)
    if (!req.user) {
      throw new HttpError(401, 'Unauthorized - Authentication required', true);
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      throw new HttpError(403, 'Forbidden - Admin access required', true);
    }

    // User is admin, proceed to next middleware/controller
    next();
  } catch (error) {
    next(error);
  }
};