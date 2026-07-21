import { Router } from 'express';
import controller from '../controller/language.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.route("/getLanguages").get(controller.getLanguage);
router.route("/addLanguage").post(authMiddleware, controller.addLanguage);

export default router;