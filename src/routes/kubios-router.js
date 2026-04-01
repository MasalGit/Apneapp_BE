import express from 'express';
// Tuodaan kontrollerit (nämä luodaan seuraavassa vaiheessa)
import kubiosAuthController from '../controllers/kubios-auth-controller.js';
import kubiosController from '../controllers/kubios-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';

const router = express.Router();

// 1. Kirjautuminen (Julkinen reitti)
router.post('/login', kubiosAuthController.kubiosLogin);

// 2. Käyttäjätiedot (Suojattu reitti)
router.get('/me', authenticateToken, kubiosAuthController.kubiosUserInfo);

// 3. Analyysin suoritus ja haku (Suojattu reitti)
router.get('/analysis', authenticateToken, kubiosController.getAndAnalyzeData);

// 4. Historia tietokannasta (Suojattu reitti)
router.get('/history', authenticateToken, kubiosController.getAnalysisHistory);

export default router;