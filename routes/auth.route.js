import { Router } from "express";
import controller from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.route("/check-user").post(controller.checkUser);

router.route("/send-otp").post(controller.sendOTP);

router.route("/verify-otp").post(controller.verifyOTP);

router.route("/refresh-token").post(controller.refreshToken);

router.route("/update-profile").put(authMiddleware, controller.updateProfile);

router
  .route("/update-selection")
  .put(authMiddleware, controller.updateUserSelection);

export default router;
