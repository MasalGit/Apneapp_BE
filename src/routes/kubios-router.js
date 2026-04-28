import {postLogin, getMe} from '../controllers/kubios-auth-controller.js';
import {getAnalysisHistory, getUserInfo, getMeasures, syncMeasurements, getMeasurement} from '../controllers/kubios-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import express from 'express';

const router = express.Router();

router.post('/login', postLogin);
router.get('/me', authenticateToken, getMe);
router.get('/userinfo', authenticateToken, getUserInfo);
router.get('/history', authenticateToken, getAnalysisHistory);
router.get('/measures', authenticateToken, getMeasures);  // uusi
router.get('/sync', authenticateToken, syncMeasurements);
router.get('/history/:id', authenticateToken, getMeasurement);

export default router;