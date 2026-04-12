import express from 'express';
import {postLogin, getMe} from '../controllers/kubios-auth-controller.js';
import {getUserData, getAnalysisHistory, getUserInfo} from '../controllers/kubios-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';

const router = express.Router();

router.post('/login', postLogin);
router.get('/me', authenticateToken, getMe);
router.get('/userinfo', authenticateToken, getUserInfo);
router.get('/results', authenticateToken, getUserData);
router.get('/history', authenticateToken, getAnalysisHistory);

export default router;