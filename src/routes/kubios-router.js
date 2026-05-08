import {postLogin, getMe} from '../controllers/kubios-auth-controller.js';
import {getAnalysisHistory, getUserInfo, getMeasures, syncMeasurements, getMeasurement} from '../controllers/kubios-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import express from 'express';

const router = express.Router();

/**
 * @api {post} /kubios/login Kirjaudu sisään
 * @apiName PostLogin
 * @apiGroup Kubios
 *
 * @apiBody {String} username Kubios-käyttäjätunnus
 * @apiBody {String} password Kubios-salasana
 *
 * @apiSuccess {String} token JWT-token
 * @apiSuccess {Object} user Käyttäjän tiedot
 * @apiSuccess {Number} user_id Paikallinen käyttäjä-ID
 */
router.post('/login', postLogin);

/**
 * @api {get} /kubios/me Kirjautuneen käyttäjän tiedot
 * @apiName GetMe
 * @apiGroup Kubios
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Object} user Käyttäjän tiedot
 * @apiSuccess {String} kubios_token Kubios ID-token
 */
router.get('/me', authenticateToken, getMe);

/**
 * @api {get} /kubios/userinfo Käyttäjätiedot Kubiosista
 * @apiName GetUserInfo
 * @apiGroup Kubios
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Object} user Kubiosin käyttäjätiedot
 */
router.get('/userinfo', authenticateToken, getUserInfo);

/**
 * @api {get} /kubios/history Mittaushistoria
 * @apiName GetHistory
 * @apiGroup Kubios
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Object[]} results Lista mittauksista
 * @apiSuccess {String} results.measure_id Mittauksen ID
 * @apiSuccess {String} results.measured_at Mittausaika
 * @apiSuccess {Number} results.duration_s Kesto sekunteina
 * @apiSuccess {Number} results.lfhf_avg LF/HF-keskiarvo
 * @apiSuccess {String} results.risk Apneariski (normal/elevated/high)
 */
router.get('/history', authenticateToken, getAnalysisHistory);

/**
 * @api {get} /kubios/history/:id Yksittäinen mittaus
 * @apiName GetMeasurement
 * @apiGroup Kubios
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} id Mittauksen ID
 *
 * @apiSuccess {String} measure_id Mittauksen ID
 * @apiSuccess {String} measured_at Mittausaika
 * @apiSuccess {Number} duration_s Kesto sekunteina
 * @apiSuccess {Number} lfhf_avg LF/HF-keskiarvo
 * @apiSuccess {String} risk Apneariski
 * @apiSuccess {Object} timeseries Aikasarjadata (tt, lf_hf, sns_index, pns_index, stress_index, max_hr, min_hr, effective_prc)
 */
router.get('/history/:id', authenticateToken, getMeasurement);

/**
 * @api {get} /kubios/measures Mittauslista Kubiosista
 * @apiName GetMeasures
 * @apiGroup Kubios
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiQuery {String} [from] Alkupäivämäärä (ISO 8601)
 * @apiQuery {String} [to] Loppupäivämäärä (ISO 8601)
 *
 * @apiSuccess {Object[]} measures Lista Kubiosin mittauksista
 */
router.get('/measures', authenticateToken, getMeasures);

/**
 * @api {get} /kubios/sync Synkronoi mittaukset
 * @apiName SyncMeasurements
 * @apiGroup Kubios
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {String} message Tilaviesti
 * @apiSuccess {Number} synced Tallennettujen mittausten määrä
 * @apiSuccess {Number} skipped Ohitettujen mittausten määrä
 */
router.get('/sync', authenticateToken, syncMeasurements);

export default router;
