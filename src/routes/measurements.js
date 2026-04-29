import express from 'express';
import { authenticateToken } from '../middlewares/authentication.js';
import db from '../utils/database.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const days = Math.min(parseInt(req.query.days) || 7, 90);

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [measurements] = await db.query(
      `SELECT measure_id, user_id, measured_at, duration_s, lfhf_avg
       FROM Measurements
       WHERE user_id = ? AND measured_at >= ?
       ORDER BY measured_at ASC`,
      [user_id, startDate]
    );

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

export default router;
