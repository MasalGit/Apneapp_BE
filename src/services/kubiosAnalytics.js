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
      analysis: { type: 'timevarying' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Analytics analyze failed: ${response.status}`);
  }

  const text = await response.text();
  const data = JSON.parse(text.replace(/\bNaN\b/g, 'null'));
  const { tt, lf_hf_power, sns_index, pns_index } = data.analysis;

  const avg = (arr) => {
    const valid = arr.filter(v => v !== null);
    return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(3));
  };

  const timeseries = { tt, lf_hf_power, sns_index, pns_index };
  const lfhf_avg = avg(lf_hf_power);

  return { timeseries, lfhf_avg };
};

export { analyzeRRI };
