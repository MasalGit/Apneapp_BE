import express from 'express';
import { body } from 'express-validator';
import {
  getBloodPressures,
  getBloodPressureById,
  postBloodPressure,
  putBloodPressure,
  deleteBloodPressureEntry,
  } from '../controllers/bloodpressure-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';  
import { validationErrorHandler } from '../middlewares/error-handlers.js';

const bloodPressureRouter = express.Router();

// muutettu verenpaineelle ystävällisiksi :) (All endpoints for 'items' resource)

bloodPressureRouter
  // define route
  .route('/')
  // hae käyttäjän kaikki verenpaineen mittaustulokset
  .get(authenticateToken, getBloodPressures)
  // lisää käyttäjän uusi verenpaineen mittaustulos
  .post(
    authenticateToken, 
    // validointisäännöt By Claude
    body('systolic', 'yläpaine on pakollinen ja sen pitää olla välillä 50-300')
      .isInt({min: 50, max: 300}),
    body('diastolic', 'alapaine on pakollinen ja sen pitää olla välillä 30-200')
      .isInt({min: 30, max: 200}),
    body('pulse', 'sykkeen pitää olla kokonaisluku välillä 30-250')
      .optional()
      .isInt({min: 30, max: 250}),
    body('measured_at', 'mittausajan pitää olla kelvollinen päivämäärä')
      .optional()
      .isISO8601(),
    body('notes', 'muistiinpanot voivat olla enintään 1000 merkkiä')
      .optional()
      .trim()
      .isLength({max: 1000}),
    validationErrorHandler,
    postBloodPressure);

// mittaustuloksen muutos ID:n mukaan  polkuun /api/bloodpressure/**)
bloodPressureRouter
  .route('/:id')
  .get(authenticateToken, getBloodPressureById)      // hae yksittäinen mittaustulos
  .put(
    authenticateToken,
  // kaikki valinnaisia PUT:ssa - muokkaa olemassa olevaa tulosta
    body('systolic', 'yläpaineen pitää olla välillä 50-300')
      .optional()
      .isInt({min: 50, max: 300}),
    body('diastolic', 'alapaineen pitää olla välillä 30-200')
      .optional()
      .isInt({min: 30, max: 200}),
    body('pulse', 'sykkeen pitää olla kokonaisluku välillä 30-250')
      .optional()
      .isInt({min: 30, max: 250}),
    body('notes', 'muistiinpanot voivat olla enintään 1000 merkkiä')
      .optional()
      .trim()
      .isLength({max: 1000}),
    validationErrorHandler,
    putBloodPressure
  )         
    
  .delete(authenticateToken, deleteBloodPressureEntry); // poista  mittaustulos



export default bloodPressureRouter;
