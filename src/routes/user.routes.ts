import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect); // All routes below this line are protected

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

export default router;
