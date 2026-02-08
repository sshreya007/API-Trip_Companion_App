import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Unauthorized - Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new HttpError(403, 'Forbidden - Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};