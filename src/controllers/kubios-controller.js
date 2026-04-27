import fetch from 'node-fetch';
import {addMeasurement, listMeasurementsByUserId, getSavedMeasureIds} from '../models/measurement-model.js';

const baseUrl = process.env.KUBIOS_API_URI;

const calculateApneaRisk = (hrvResults) => {
  if (!hrvResults || hrvResults.length === 0) {
    return {risk: 'unknown', label: 'Ei dataa', explanation: 'Ei tarpeeksi dataa analyysiin.'};
  }

  const avg = (key) => {
    const vals = hrvResults.map(r => r[key]).filter(v => v != null);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const lfhf = avg('lf_hf_ratio');

  if (lfhf === null) {
    return {risk: 'unknown', label: 'Ei dataa', explanation: 'LF/HF-data puuttuu.'};
  }

  let risk, label;
  if (lfhf > 1.2)      {risk = 'high';     label = 'Korkea';}
  else if (lfhf > 0.6) {risk = 'elevated'; label = 'Kohonnut';}
  else                 {risk = 'low';      label = 'Matala';}

  return {
    risk,
    label,
    lfhf_avg: lfhf.toFixed(2),
    explanation: `LF/HF-keskiarvo: ${lfhf.toFixed(2)}. ` +
      'Viitearvot (Hakala 2017): normaali yöuni ~0.34, hypopnea ~1.55.'
  };
};

const getUserData = async (req, res, next) => {
  const {kubiosIdToken, userId} = req.user;

  const to = req.query.to || new Date().toISOString();
  const from = req.query.from ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const headers = new Headers();
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  headers.append('Authorization', kubiosIdToken);
  headers.append('x-api-key', process.env.KUBIOS_API_KEY);

  try {
    const response = await fetch(
      `${baseUrl}/result/self?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      {method: 'GET', headers}
    );
    if (!response.ok) throw new Error(`Kubios API error: ${response.status}`);

    const data = await response.json();
    const results = data.results || [];

    let savedCount = 0;
    let skippedCount = 0;

    for (const r of results) {
      const measured_at = new Date(r.measured_timestamp)
        .toISOString().slice(0, 19).replace('T', ' ');

      const insertResult = await addHrvResult({
        user_id:      userId,
        measured_at,
        mean_rr_ms:   r.result?.mean_rr_ms,
        rmssd_ms:     r.result?.rmssd_ms,
        sdnn_ms:      r.result?.sdnn_ms,
        pns_index:    r.result?.pns_index,
        sns_index:    r.result?.sns_index,
        stress_index: r.result?.stress_index,
        readiness:    r.result?.readiness,
        lf_hf_ratio:  r.result?.freq_domain?.LF_HF_power,
        result_id:    r.result_id,
      });

      if (insertResult?.hrv_id && insertResult.hrv_id > 0) {
        savedCount++;
      } else {
        skippedCount++;
      }
    }

    const risk = calculateApneaRisk(results.map(r => ({
      lf_hf_ratio: r.result?.freq_domain?.LF_HF_power
    })));

    return res.json({
      message: 'Data haettu',
      count: results.length,
      saved: savedCount,
      skipped: skippedCount,
      risk,
      results,
    });
  } catch (err) {
    next(err);
  }
};

const getAnalysisHistory = async (req, res, next) => {
  try {
    const results = await listMeasurementsByUserId(req.user.userId);
    return res.json({ results });
  } catch (err) {
    next(err);
  }
};

const getUserInfo = async (req, res, next) => {
  const {kubiosIdToken} = req.user;
  const headers = new Headers();
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  headers.append('Authorization', kubiosIdToken);
  headers.append('x-api-key', process.env.KUBIOS_API_KEY);
  try {
    const response = await fetch(`${baseUrl}/user/self`, {method: 'GET', headers});
    if (!response.ok) throw new Error(`Kubios API error: ${response.status}`);
    return res.json(await response.json());
  } catch (err) {
    next(err);
  }
};

const syncMeasurements = async (req, res, next) => {
  const { kubiosIdToken, userId } = req.user;

  const headers = new Headers();
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  headers.append('Authorization', kubiosIdToken);
  headers.append('x-api-key', process.env.KUBIOS_API_KEY);

  try {
    const response = await fetch(
      `${baseUrl}/measure/self/session?details=yes&from=2020-01-01T00:00:00.000Z`,
      { method: 'GET', headers }
    );
    const data = await response.json();

    console.log('Kaikki mittaukset:', data.measures.map(m => ({
      id: m.measure_id,
      state: m.state,
      channels: m.channels.map(ch => ({ type: ch.type, has_url: !!ch.data_url }))
    })));

    const measures = data.measures.filter(m =>
      m.state === 'finalized' &&
      m.channels.some(ch => ch.type === 'RRI' && ch.data_url)
    );

    console.log('Finalized RRI-mittauksia:', measures.length); //testausta
    console.log('IDs:', measures.map(m => m.measure_id)); //testausta

    let syncedCount = 0;
    let skippedCount = 0;

    for (const measure of measures) {
      const rriChannel = measure.channels.find(
        ch => ch.type === 'RRI' && ch.data_url
      );

      const dataResponse = await fetch(rriChannel.data_url);
      const buffer = await dataResponse.arrayBuffer();
      const view = new DataView(buffer);
      const rriValues = [];
      for (let i = 0; i < buffer.byteLength; i += 2) {
        rriValues.push(view.getUint16(i, true));
      }

      const duration_s = rriValues.reduce((a, b) => a + b, 0) / 1000;
      console.log('Mittaus:', measure.measure_id, 'kesto:', duration_s); // testausta
      if (duration_s < 60) { skippedCount++; continue; }

      let sum = 0;
      for (let i = 1; i < rriValues.length; i++) {
        const diff = rriValues[i] - rriValues[i - 1];
        sum += diff * diff;
      }
      const rmssd = Math.sqrt(sum / (rriValues.length - 1));
      const lfhf_avg = parseFloat((100 / rmssd).toFixed(3));

      let risk;
      if (lfhf_avg < 0.7)      risk = 'normal';
      else if (lfhf_avg < 1.2) risk = 'elevated';
      else                     risk = 'high';

      const timeseries = rriValues.map((rri, i) => ({
        t: Math.round(rriValues.slice(0, i).reduce((a, b) => a + b, 0) / 1000),
        lfhf: lfhf_avg
      }));

      const measured_at = new Date(measure.measured_timestamp)
        .toISOString().slice(0, 19).replace('T', ' ');

      const result = await addMeasurement({
        measure_id: measure.measure_id,
        user_id: userId,
        measured_at,
        duration_s,
        lfhf_avg,
        risk,
        timeseries
      });

      if (result.error) { skippedCount++; } else { syncedCount++; }
    }

    return res.json({
      message: 'Synkronointi valmis',
      synced: syncedCount,
      skipped: skippedCount
    });
  } catch (err) {
    next(err);
  }
};



const getMeasures = async (req, res, next) => {
  const {kubiosIdToken} = req.user;

  const to = req.query.to || new Date().toISOString();
  const from = req.query.from ||
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(); // oletuksena 1 vuosi

  const headers = new Headers();
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  headers.append('Authorization', kubiosIdToken);
  headers.append('x-api-key', process.env.KUBIOS_API_KEY);

  try {
    const response = await fetch(
      `${baseUrl}/measure/self/session?details=yes&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      {method: 'GET', headers}
    );
    if (!response.ok) throw new Error(`Kubios API error: ${response.status}`);

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

export {getUserData, getAnalysisHistory, getUserInfo, syncMeasurements, getMeasures};