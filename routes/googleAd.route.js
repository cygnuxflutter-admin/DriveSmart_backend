import { Router } from 'express';
import controller from '../controller/googleAd.controller.js';

const router = Router();

router.route('/ids').get(controller.getGoogleAdIds);

router.route('/addIds').post(controller.addGoogleAdIds);

router.route('/editIds/:id').post(controller.editGoogleAdIds);

router.route('/deleteIds/:id').post(controller.deleteGoogleAdIds);

export default router;
