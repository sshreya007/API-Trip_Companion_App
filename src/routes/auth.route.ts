import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../controllers/profile.controller";
// Add this to your existing auth routes

const router = Router();

router.post("/register", register);
router.post("/login", login);


export default router;
