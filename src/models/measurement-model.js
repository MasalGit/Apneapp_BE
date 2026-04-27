import promisePool from '../utils/database.js';

const addMeasurement = async (measurement) => {
  const { measure_id, user_id, measured_at, duration_s, lfhf_avg, risk, timeseries } = measurement;
  const sql = `INSERT IGNORE INTO Measurements
    (measure_id, user_id, measured_at, duration_s, lfhf_avg, risk, timeseries)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    measure_id,
    user_id,
    measured_at,
    duration_s,
    lfhf_avg,
    risk,
    JSON.stringify(timeseries)
  ];
  try {
    const [result] = await promisePool.execute(sql, params);
    return { measure_id, inserted: result.affectedRows > 0 };
  } catch (e) {
    console.error('addMeasurement error', e.message);
    return { error: e.message };
  }
};

const listMeasurementsByUserId = async (user_id) => {
  try {
    const sql = `SELECT measure_id, measured_at, duration_s, lfhf_avg, risk
                 FROM Measurements
                 WHERE user_id = ?
                 ORDER BY measured_at DESC`;
    const [rows] = await promisePool.execute(sql, [user_id]);
    return rows;
  } catch (e) {
    console.error('listMeasurementsByUserId error', e.message);
    return { error: e.message };
  }
};

const getSavedMeasureIds = async (user_id) => {
  try {
    const sql = 'SELECT measure_id FROM Measurements WHERE user_id = ?';
    const [rows] = await promisePool.execute(sql, [user_id]);
    return rows.map(row => row.measure_id);
  } catch (e) {
    console.error('getSavedMeasureIds error', e.message);
    return [];
  }
};

export { addMeasurement, listMeasurementsByUserId, getSavedMeasureIds };