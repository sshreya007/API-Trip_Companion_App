// import { Router } from 'express';
// import { AdminController } from '../controllers/admin.controller';
// import { isAdmin } from '../middleware/admin.middleware';
// import upload from '../middleware/upload_middleware';
// // You'll need authentication middleware too
// import { authenticate } from '../middleware/auth.middleware'; // Assuming you have this

// const router = Router();
// const adminController = new AdminController();

// // All admin routes require authentication and admin role
// router.use(authenticate, isAdmin);

// router.post('/users', upload.single('image'), adminController.createUser);
// router.get('/users', adminController.getAllUsers);
// router.get('/users/:id', adminController.getUserById);
// router.put('/users/:id', upload.single('image'), adminController.updateUser);
// router.delete('/users/:id', adminController.deleteUser);

// export default router;