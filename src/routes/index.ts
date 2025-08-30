import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
// import orderRoutes from "./order.routes.js";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
// router.use("/orders", orderRoutes);

export default router;
