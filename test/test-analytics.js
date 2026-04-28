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

// 3. Etsi kaikki pitkät RRI-mittaukset
const measures = data.measures.filter(
  (m) =>
    m.state === 'finalized' &&
    m.channels.some((ch) => ch.type === 'RRI' && ch.data_url && ch.data_size > 10000)
);

if (measures.length === 0) {
  console.error('Ei sopivia mittauksia');
  process.exit(1);
}

console.log(`Löytyi ${measures.length} pitkää mittausta`);

// 4-5. Käy jokainen mittaus läpi
for (const measure of measures) {
  console.log('\nMittaus:', measure.measure_id);

  const rriChannel = measure.channels.find((ch) => ch.type === 'RRI' && ch.data_url);
  const s3Res = await fetch(rriChannel.data_url);
  if (!s3Res.ok) {
    console.error('S3 haku epäonnistui:', s3Res.status);
    continue;
  }

  const buffer = await s3Res.arrayBuffer();
  const view = new DataView(buffer);
  const rriValues = [];
  for (let i = 0; i < buffer.byteLength; i += 2) {
    rriValues.push(view.getUint16(i, true));
  }
  console.log('RRI-pisteitä:', rriValues.length);

  console.log(`Lähetetään Analytics-kutsu... (${rriValues.length} RRI-pistettä)`);
  const result = await analyzeRRI(rriValues);

  console.log('lfhf_avg:', result.lfhf_avg);
  console.log('timeseries pisteitä:', result.timeseries.tt.length);
}
