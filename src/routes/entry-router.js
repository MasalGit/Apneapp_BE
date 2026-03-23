import express from 'express';
import { body } from 'express-validator';
import {
  deleteEntry,
  getEntries,
  getEntryById,
  postEntry,
  putEntry,
} from '../controllers/entry-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {validationErrorHandler} from '../middlewares/error-handlers.js'; // validointi Clauden kanssa

const entryRouter = express.Router();

entryRouter
  .route('/')
  .get(authenticateToken, getEntries)
  .post(
    // validointisäännöt - AI-assisted
    authenticateToken,
    body('entry_date', 'päivämäärä on pakollinen ja sen pitää olla muodossa YYYY-MM-DD')
      .isDate(),
    body('mood', 'mieliala voi olla enintään 50 merkkiä')
      .optional({ nullable: true })
      .trim()
      .isLength({max: 50}),
    body('weight', 'painon pitää olla numero välillä 1-500')
      .optional({ nullable: true })
      .isFloat({min: 1, max: 500}),
    body('sleep_hours', 'unituntien pitää olla kokonaisluku välillä 0-24')
      .optional({ nullable: true })
      .isInt({min: 0, max: 24}),
    body('notes', 'muistiinpanot voivat olla enintään 1000 merkkiä')
      .optional({ nullable: true })
      .trim()
      .isLength({max: 1000}),
    validationErrorHandler,
    postEntry
  );

entryRouter
  .route('/:id')
  .get(authenticateToken, getEntryById) // lisätty authenticateToken 
  .put(
    authenticateToken, 
        // samat säännöt kuin POST mutta kaikki valinnaisia
    body('entry_date', 'päivämäärä pitää olla muodossa YYYY-MM-DD')
      .optional({ nullable: true })
      .isDate(),
    body('mood', 'mieliala voi olla enintään 50 merkkiä')
      .optional({ nullable: true })
      .trim()
      .isLength({max: 50}),
    body('weight', 'painon pitää olla numero välillä 1-500')
      .optional({ nullable: true })
      .isFloat({min: 1, max: 500}),
    body('sleep_hours', 'unituntien pitää olla kokonaisluku välillä 0-24')
      .optional({ nullable: true })
      .isInt({min: 0, max: 24}),
    body('notes', 'muistiinpanot voivat olla enintään 1000 merkkiä')
      .optional({ nullable: true })
      .trim()
      .isLength({max: 1000}),
    validationErrorHandler,
    putEntry
  )
  .delete(authenticateToken, deleteEntry);

export default entryRouter;
