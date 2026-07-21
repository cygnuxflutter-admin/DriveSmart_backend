import express from "express";
import {
  addQuizResult,
  getUserQuizResults,
  getUserQuizStats,
  getQuizResultById,
  getQuizHistory,
} from "../controller/quizResult.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/add").post(authMiddleware, addQuizResult);

router.route("/history").get(authMiddleware, getQuizHistory);

router.route("/stats/:userId").get(authMiddleware, getUserQuizStats);

router.route("/user/:userId").get(authMiddleware, getUserQuizResults);

router.route("/:resultId").get(authMiddleware, getQuizResultById);

export default router;
