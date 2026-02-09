import { Router } from 'express';
import { PackageController } from '../controllers/package.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import upload from '../middleware/upload_middleware';

const router = Router();
const packageController = new PackageController();

// Public routes
router.get('/', packageController.getAllPackages);
router.get('/featured', packageController.getFeaturedPackages);
router.get('/category/:category', packageController.getPackagesByCategory);
router.get('/:id', packageController.getPackageById);
router.get('/:id/availability', packageController.checkAvailability);

// Admin routes
router.post('/', authenticate, isAdmin, upload.single('coverImage'), packageController.createPackage);
router.put('/:id', authenticate, isAdmin, upload.single('coverImage'), packageController.updatePackage);
router.delete('/:id', authenticate, isAdmin, packageController.deletePackage);
router.patch('/:id/toggle-status', authenticate, isAdmin, packageController.toggleActiveStatus);

export default router;