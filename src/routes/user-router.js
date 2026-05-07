import express from 'express';
import { body } from 'express-validator';
import {getUserById, putUser, deleteUser} from '../controllers/user-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {validationErrorHandler} from '../middlewares/error-handlers.js';

const userRouter = express.Router();

/**
 * @api {get} /users/:id Hae käyttäjä ID:llä
 * @apiName GetUser
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id Käyttäjän ID
 *
 * @apiSuccess {Number} user_id Käyttäjän ID
 * @apiSuccess {String} username Käyttäjätunnus
 * @apiSuccess {String} email Sähköpostiosoite
 * @apiSuccess {String} created_at Luontiaika
 */

/**
 * @api {put} /users/:id Päivitä käyttäjän tiedot
 * @apiName PutUser
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id Käyttäjän ID
 *
 * @apiBody {String} [username] Uusi käyttäjätunnus (3-20 merkkiä, vain kirjaimet ja numerot)
 * @apiBody {String} [email] Uusi sähköpostiosoite
 * @apiBody {String} [password] Uusi salasana
 *
 * @apiSuccess {String} message Tilaviesti
 */

/**
 * @api {delete} /users/:id Poista käyttäjä
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} id Käyttäjän ID
 *
 * @apiSuccess {String} message Tilaviesti
 */
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
