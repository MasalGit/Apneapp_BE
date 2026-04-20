import {postLogin, getMe} from '../controllers/kubios-auth-controller.js';
import {getUserData, getAnalysisHistory, getUserInfo, getMeasures} from '../controllers/kubios-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import express from 'express';

const router = express.Router();

router.post('/login', postLogin);
router.get('/me', authenticateToken, getMe);
router.get('/userinfo', authenticateToken, getUserInfo);
router.get('/results', authenticateToken, getUserData);
router.get('/history', authenticateToken, getAnalysisHistory);
router.get('/measures', authenticateToken, getMeasures);  // uusi

export default router;