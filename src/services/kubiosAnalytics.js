import fetch from 'node-fetch';

const TOKEN_URL = 'https://kubioscloud.auth.eu-west-1.amazoncognito.com/oauth2/token';
const ANALYZE_URL = `${process.env.KUBIOS_API_URI}/analytics/analyze`;

let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.KUBIOS_CLIENT_ID_2,
    client_secret: process.env.KUBIOS_CLIENT_SECRET,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Analytics token fetch failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
};

const calculateRisk = (timeseries) => {
  const { lf_hf_power, sns_index, pns_index, max_hr, min_hr, effective_prc } = timeseries;
  const total = lf_hf_power.length;
  let alerts = 0;

  for (let i = 0; i < total; i++) {
    if (effective_prc && effective_prc[i] !== null && effective_prc[i] < 50) continue;

    let triggered = 0;
    if (lf_hf_power[i] !== null && lf_hf_power[i] > 1.5) triggered++;
    if (max_hr?.[i] !== null && min_hr?.[i] !== null && (max_hr[i] - min_hr[i]) > 15) triggered++;
    if (sns_index?.[i] !== null && sns_index[i] > 2.0) triggered++;
    if (pns_index?.[i] !== null && pns_index[i] < -1.0) triggered++;

    if (triggered >= 2) alerts++;
  }

  const ratio = alerts / total;
  if (ratio < 0.2)      return 'normal';
  if (ratio < 0.4)      return 'elevated';
  return 'high';
};

const analyzeRRI = async (rriValues) => {
  const token = await getAccessToken();

  const response = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-api-key': process.env.KUBIOS_API_KEY,
    },
    body: JSON.stringify({
      type: 'RRI',
      data: rriValues,
      analysis: {
        type: 'timevarying',
        preferences: {
          tv_window: 300,
          tv_window_shift: 60,
          beat_correction_method: 'automatic',
          enable_noise_detection: true,
          tv_effective_prc_threshold: 50,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Analytics analyze failed: ${response.status}`);
  }

  const text = await response.text();
  const data = JSON.parse(text.replace(/\bNaN\b/g, 'null'));
  const a = data.analysis;

  const avg = (arr) => {
    if (!arr) return null;
    const valid = arr.filter(v => v !== null);
    if (valid.length === 0) return null;
    return parseFloat((valid.reduce((x, y) => x + y, 0) / valid.length).toFixed(3));
  };

  const timeseries = {
    tt:           a.tt,
    lf_hf:        a.lf_hf_power,
    sns_index:    a.sns_index,
    pns_index:    a.pns_index,
    stress_index: a.stress_index,
    max_hr:       a.max_hr,
    min_hr:       a.min_hr,
    effective_prc: a.effective_prc,
  };

  const lfhf_avg = avg(a.lf_hf_power);
  const risk = calculateRisk({ ...timeseries, lf_hf_power: a.lf_hf_power });

  return { timeseries, lfhf_avg, risk };
};

export { analyzeRRI };
