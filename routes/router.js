import { Router } from 'express';
import countryRoutes from './country.route.js';
import questionRoute from './question.route.js';
import languageRoutes from './language.route.js';
import loginRoutes from './auth.route.js';
import stateRoutes from './state.route.js';
import quizResultRoutes from './quizResult.route.js';
import googleAdRoutes from './googleAd.route.js';

const router = Router();

console.log('Main router initializing...');

router.use('/country', countryRoutes);
router.use('/language', languageRoutes);
router.use('/questions', questionRoute);
router.use('/auth', loginRoutes);
router.use('/state', stateRoutes);
router.use('/quiz-results', quizResultRoutes);
router.use('/google-ads', googleAdRoutes);

export default router;