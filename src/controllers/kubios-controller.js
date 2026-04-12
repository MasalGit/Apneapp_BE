import fetch from 'node-fetch';
import {addHrvResult, listHrvResultsByUserId} from '../models/hrv-model.js';

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

  const sns = avg('sns_index');
  const pns = avg('pns_index');
  const lfhfEstimate = sns && pns && pns !== 0 ? sns / Math.abs(pns) : null;

  let risk, label, explanation;

  if (lfhfEstimate === null) {
    const snsVal = sns ?? 0;
    if (snsVal > 1.5)      {risk = 'high';     label = 'Korkea';}
    else if (snsVal > 0.5) {risk = 'elevated'; label = 'Kohonnut';}
    else                   {risk = 'low';      label = 'Matala';}
    explanation = 'Arvio perustuu sympaattisen hermoston aktiivisuuteen.';
  } else {
    // Kynnysarvot perustuvat Hakala 2017 tutkimukseen:
    // normaali uni LF/HF ≈ 0.34, hypopnea LF/HF ≈ 1.55
    if (lfhfEstimate > 1.2)      {risk = 'high';     label = 'Korkea';}
    else if (lfhfEstimate > 0.6) {risk = 'elevated'; label = 'Kohonnut';}
    else                         {risk = 'low';      label = 'Matala';}
    explanation = `LF/HF-estimaatti: ${lfhfEstimate.toFixed(2)}. ` +
      'Viitearvot: normaali uni ~0.34, uniapnea ~1.55 (Hakala 2017).';
  }

  return {risk, label, explanation, lfhfEstimate};
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

    // Tallennetaan jokainen tulos omaan DB:hen
    for (const r of results) {
      await addHrvResult({
        user_id:      userId,
        measured_at:  new Date(r.measured_timestamp).toISOString().slice(0, 19).replace('T', ' '),
        mean_rr_ms:   r.result?.mean_rr_ms,
        rmssd_ms:     r.result?.rmssd_ms,
        sdnn_ms:      r.result?.sdnn_ms,
        pns_index:    r.result?.pns_index,
        sns_index:    r.result?.sns_index,
        stress_index: r.result?.stress_index,
        readiness:    r.result?.readiness,
      });
    }

    // Lasketaan riskiarvio tallennetuista tuloksista
    const risk = calculateApneaRisk(results.map(r => r.result));

    return res.json({
      message: 'Data haettu ja tallennettu',
      count: results.length,
      risk,
      results,
    });
  } catch (err) {
    next(err);
  }
};

const getAnalysisHistory = async (req, res, next) => {
  try {
    const results = await listHrvResultsByUserId(req.user.userId);
    const risk = calculateApneaRisk(results);
    return res.json({results, risk});
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

export {getUserData, getAnalysisHistory, getUserInfo};