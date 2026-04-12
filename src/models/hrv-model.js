import promisePool from '../utils/database.js';

const addHrvResult = async (result) => {
  const {
    user_id, measured_at, mean_rr_ms, rmssd_ms,
    sdnn_ms, pns_index, sns_index, stress_index, readiness
  } = result;
  const sql = `INSERT INTO HrvResults
    (user_id, measured_at, mean_rr_ms, rmssd_ms, sdnn_ms,
     pns_index, sns_index, stress_index, readiness)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    user_id, measured_at, mean_rr_ms, rmssd_ms,
    sdnn_ms, pns_index, sns_index, stress_index, readiness
  ];
  try {
    const result = await promisePool.execute(sql, params);
    return {hrv_id: result[0].insertId};
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

const listHrvResultsByUserId = async (user_id) => {
  try {
    const sql = 'SELECT * FROM HrvResults WHERE user_id = ? ORDER BY measured_at DESC';
    const [rows] = await promisePool.execute(sql, [user_id]);
    return rows;
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

const findHrvResultById = async (hrv_id, user_id) => {
  try {
    const sql = 'SELECT * FROM HrvResults WHERE hrv_id = ? AND user_id = ?';
    const [rows] = await promisePool.execute(sql, [hrv_id, user_id]);
    return rows[0];
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

export {addHrvResult, listHrvResultsByUserId, findHrvResultById};