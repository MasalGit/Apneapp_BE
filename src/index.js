import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRouter from './routes/user-router.js';
import requestLogger from './middlewares/logger.js';
import entryRouter from './routes/entry-router.js';
import kubiosRouter from './routes/kubios-router.js';
import { notFoundHandler, errorHandler } from './middlewares/error-handlers.js';

const hostname = '127.0.0.1';
const app = express();
const port = 3000;

// enable CORS requests
app.use(cors());

// parsitaan json data pyynnöstä ja lisätään request-objektiin
app.use(express.json());
// Oma loggeri middleware, käytössä koko sovelluksen laajuisesti eli käsittee kaikki http-pyynnöt
app.use(requestLogger);

// Users resource router for all /api/users routes
app.use('/api/users', userRouter);
// Diary entries resource router 
app.use('/api/entries', entryRouter);

// Kubios Cloud API integration and apnea analysis
app.use('/api/kubios', kubiosRouter);

// API root
app.get('/api', (req, res) => {
  res.send('ApneApp');
});


// tarjoillaan webbisivusto (front-end) palvelimen juuressa
app.use('/', express.static('public'));

// Jos pyyntö ei täsmää yhteenkään reittiin yllä, tämä käsittelee sen
app.use(notFoundHandler);

// Kaikki next(error)-kutsut ohjautuvat tänne
app.use(errorHandler);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
