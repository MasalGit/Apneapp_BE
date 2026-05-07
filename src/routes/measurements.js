import express from 'express';
import { authenticateToken } from '../middlewares/authentication.js';
import db from '../utils/database.js';

const router = express.Router();

/**
 * @api {get} /measurements Mittausdata päivittäin ryhmiteltynä
 * @apiName GetMeasurements
 * @apiGroup Measurements
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiQuery {Number} [days=7] Palautettavien päivien määrä (max 365)
 *
 * @apiSuccess {Object[]} data Päivittäinen mittausdata
 * @apiSuccess {String} data.date Päivämäärä (YYYY-MM-DD)
 * @apiSuccess {Number} data.hours Unen kesto tunteina
 * @apiSuccess {Number} data.lfhf LF/HF-suhteen keskiarvo
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const days = Math.min(parseInt(req.query.days) || 7, 365);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [measurements] = await db.query(
      `SELECT measured_at, duration_s, lfhf_avg
       FROM Measurements
       WHERE user_id = ? AND measured_at >= ?
       ORDER BY measured_at ASC`,
      [user_id, startDate]
    );

    // Group by day
    const grouped = {};

    measurements.forEach(m => {
      const day = new Date(m.measured_at).toISOString().split("T")[0];

      if (!grouped[day]) {
        grouped[day] = {
          date: day,
          hours: 0,
          lfhf: 0,
          count: 0
        };
      }

      grouped[day].hours += m.duration_s / 3600;
      grouped[day].lfhf += m.lfhf_avg;
      grouped[day].count++;
    });

    const formattedData = Object.values(grouped).map(d => ({
      date: d.date,
      hours: Number(d.hours.toFixed(2)),
      lfhf: Number((d.lfhf / d.count).toFixed(3))
    }));

    res.json(formattedData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
});



/**
 * @api {get} /measurements/report Uniapnearaportti
 * @apiName GetReport
 * @apiGroup Measurements
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiQuery {Number} [days=7] Raportin aikaväli päivissä (max 90)
 *
 * @apiSuccess {Number} avgSleep Keskimääräinen unen kesto (h)
 * @apiSuccess {Number} avgLFHF Keskimääräinen LF/HF-suhde
 * @apiSuccess {Number} elevatedRatio Kohonneen riskin mittausten osuus (0-1)
 * @apiSuccess {Number} totalMeasurements Mittausten kokonaismäärä
 */
router.get('/report', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const days = Math.min(parseInt(req.query.days) || 7, 90);

    const [rows] = await db.query(
      `SELECT duration_s, lfhf_avg, risk
       FROM Measurements
       WHERE user_id = ?
       AND measured_at >= NOW() - INTERVAL ? DAY`,
      [user_id, days]
    );

    if (rows.length === 0) {
      return res.json({ message: "No data available" });
    }

    const avgSleep =
      rows.reduce((sum, r) => sum + r.duration_s, 0) / rows.length / 3600;

    const avgLFHF =
      rows.reduce((sum, r) => sum + r.lfhf_avg, 0) / rows.length;

    const elevatedCount =
      rows.filter(r => r.risk === "elevated").length;

    res.json({
      avgSleep: Number(avgSleep.toFixed(1)),
      avgLFHF: Number(avgLFHF.toFixed(2)),
      elevatedRatio: elevatedCount / rows.length,
      totalMeasurements: rows.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
