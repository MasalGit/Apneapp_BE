import fetch from 'node-fetch';
import 'dotenv/config';
import { analyzeRRI } from '../src/services/kubiosAnalytics.js';

const BASE_URL = 'http://localhost:3000';

// 1. Kirjaudu sisään
const loginRes = await fetch(`${BASE_URL}/api/kubios/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: process.env.KUBIOS_USERNAME,
    password: process.env.KUBIOS_PASSWORD,
  }),
});
const { token } = await loginRes.json();
console.log('Login ok, token saatu');

// 2. Hae mittauslista
const measuresRes = await fetch(`${BASE_URL}/api/kubios/measures?details=yes`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await measuresRes.json();

// 3. Etsi ensimmäinen pitkä RRI-mittaus
const measure = data.measures.find(
  (m) =>
    m.state === 'finalized' &&
    m.channels.some((ch) => ch.type === 'RRI' && ch.data_url && ch.data_size > 10000)
);

if (!measure) {
  console.error('Ei sopivia mittauksia');
  process.exit(1);
}

console.log('Mittaus:', measure.measure_id);

// 4. Lataa RRI-data S3:sta
const rriChannel = measure.channels.find((ch) => ch.type === 'RRI' && ch.data_url);
const s3Res = await fetch(rriChannel.data_url);
if (!s3Res.ok) {
  console.error('S3 haku epäonnistui:', s3Res.status);
  process.exit(1);
}

const buffer = await s3Res.arrayBuffer();
const view = new DataView(buffer);
const rriValues = [];
for (let i = 0; i < buffer.byteLength; i += 2) {
  rriValues.push(view.getUint16(i, true));
}
console.log('RRI-pisteitä:', rriValues.length);

// 5. Lähetä Analytics-kutsu
console.log(`Lähetetään Analytics-kutsu... (${rriValues.length} RRI-pistettä)`);
const result = await analyzeRRI(rriValues);

console.log('lfhf_avg:', result.lfhf_avg);
console.log('timeseries pisteitä:', result.timeseries.tt.length);
console.log('Esimerkki:', {
  tt: result.timeseries.tt.slice(0, 3),
  lf_hf_power: result.timeseries.lf_hf_power.slice(0, 3),
  sns_index: result.timeseries.sns_index.slice(0, 3),
  pns_index: result.timeseries.pns_index.slice(0, 3),
});
