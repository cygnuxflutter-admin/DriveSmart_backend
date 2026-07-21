import { Router } from 'express';
import controller from '../controller/question.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.route("/getQuestions").get(authMiddleware, controller.getQuestions);
router.route("/addQuestions").post(authMiddleware, controller.addQuestion);


export default router;