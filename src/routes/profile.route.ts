import { Router } from 'express';
import { ProfileController, upload } from '../controllers/profile.controller';

const router = Router();
const profileController = new ProfileController();

// GET /api/profile/:userId - Get user profile
router.get('/:userId', (req, res) => profileController.getProfile(req, res));

// PUT /api/profile/:userId - Update user profile
router.put('/:userId', (req, res) => profileController.updateProfile(req, res));

// POST /api/profile/upload - Upload profile image
router.post('/upload', upload.single('image'), (req, res) => 
  profileController.uploadProfileImage(req, res)
);

export default router;