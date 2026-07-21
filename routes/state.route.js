import { Router } from 'express';
import controller from '../controller/state.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.route("/getStates").get(controller.getStates);
router.route("/addState").post(authMiddleware, controller.addState);

export default router;