import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const profileService = new ProfileService();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export class ProfileController {
  // GET /api/profile/:userId
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // ✅ FIX: Convert to string
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const profile = await profileService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to get profile',
      });
    }
  }

  // PUT /api/profile/:userId
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // ✅ FIX: Convert to string
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const { name, gender, age, bio } = req.body;

      const profile = await profileService.updateProfile(userId, {
        name,
        gender,
        age: age ? parseInt(age) : undefined,
        bio,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }

  // POST /api/profile/upload
  async uploadProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
        return;
      }

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      // Generate image URL
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${file.filename}`;

      // Update user profile with image URL
      const result = await profileService.updateProfileImage(userId, imageUrl);

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        imageUrl: result.imageUrl,
      });
    } catch (error: any) {
      console.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  }
}