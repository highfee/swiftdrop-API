import { Router } from "express";
import {
  login,
  register,
  logout,
  refresh,
} from "../controllers/auth.controller.js";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);

// Add logout and refresh endpoints
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
