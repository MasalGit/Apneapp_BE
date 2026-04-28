import fetch from 'node-fetch';
import {addMeasurement, listMeasurementsByUserId, getMeasurementById} from '../models/measurement-model.js';
import {analyzeRRI} from '../services/kubiosAnalytics.js';

const baseUrl = process.env.KUBIOS_API_URI;


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
      if (duration_s < 300) { skippedCount++; continue; }

      const { timeseries, lfhf_avg } = await analyzeRRI(rriValues);

      let risk;
      if (lfhf_avg < 0.7)      risk = 'normal';
      else if (lfhf_avg < 1.2) risk = 'elevated';
      else                     risk = 'high';

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

const getMeasurement = async (req, res, next) => {
  try {
    const measurement = await getMeasurementById(req.params.id, req.user.userId);
    if (!measurement) return res.status(404).json({message: 'Measurement not found'});
    return res.json(measurement);
  } catch (err) {
    next(err);
  }
};

export {getAnalysisHistory, getUserInfo, syncMeasurements, getMeasures, getMeasurement};