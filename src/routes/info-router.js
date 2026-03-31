import express from 'express';

const infoRouter = express.Router();

infoRouter.get('/', (req, res) => {
  res.status(200).json({
    app: 'ApneApp backend',
    version: '1.0',
    status: 'development',
  });
});

export default infoRouter;