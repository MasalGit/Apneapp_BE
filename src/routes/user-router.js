import express from 'express';
import { body } from 'express-validator';
import {getUserById, putUser, deleteUser} from '../controllers/user-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {validationErrorHandler} from '../middlewares/error-handlers.js';

const userRouter = express.Router();

// käyttäjän haku, muokkaus ja poisto ID:n perusteella
userRouter.route('/:id')
  .get(authenticateToken, getUserById)
  .put(
    authenticateToken,
    body('username', 'käyttäjänimen pitää olla 3-20 merkkiä ja sisältää vain kirjaimia ja numeroita')
      .optional()
      .trim()
      .isLength({min: 3, max: 20})
      .isAlphanumeric(),
    body('email', 'sähköpostiosoite ei ole kelvollinen')
      .optional()
      .trim()
      .isEmail()
      .normalizeEmail(),
    validationErrorHandler,
    putUser
  )
  .delete(authenticateToken, deleteUser);


export default userRouter;
