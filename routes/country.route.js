import { Router } from 'express';
import controller from '../controller/country.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.route("/getCountry").get(controller.getCountry);
router.route("/addCountry").post(authMiddleware, controller.addCountry);

export default router;
