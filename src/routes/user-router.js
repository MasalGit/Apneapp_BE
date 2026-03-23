import express from 'express';
import { body } from 'express-validator';
import {getMe, getUsers, postLogin, postUser, getUserById, putUser, deleteUser} from '../controllers/user-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {validationErrorHandler} from '../middlewares/error-handlers.js';

const userRouter = express.Router();

// Users resource endpoints
userRouter.route('/')
// GET all users
.get(authenticateToken, getUsers)
// POST new user - lisätty validointisäännöt - Clauden kanssa
.post(
    body('username', 'käyttäjänimen pitää olla 3-20 merkkiä ja sisältää vain kirjaimia ja numeroita')
      .trim()
      .isLength({min: 3, max: 20})
      .isAlphanumeric(),
    body('password', 'salasanan pitää olla vähintään 8 merkkiä')
      .trim()
      .isLength({min: 8}),
    body('email', 'sähköpostiosoite ei ole kelvollinen')
      .trim()
      .isEmail()
      .normalizeEmail(),
    // validointivirheet käsitellään ennen controlleria, jos validointi epäonnistuu - pyyntö ei controllerille
    validationErrorHandler,
    postUser
  );

userRouter.post('/login', postLogin);
userRouter.get('/me', authenticateToken, getMe);


// TODO: get user by id - tehty, minä ja Calude
// TODO: put user by id - tehty, minä ja Calude
// TODO: delete user by id - tehty, minä ja Calude
// app.get('/api/users/:id');

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
