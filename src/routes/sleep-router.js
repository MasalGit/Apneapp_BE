import express from 'express';
import { getSleepHours, getSleepQuality } from '../controllers/sleep-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';

const sleepRouter = express.Router();

sleepRouter.get('/hours', authenticateToken, getSleepHours);
sleepRouter.get('/quality', authenticateToken, getSleepQuality);

export default sleepRouter;
