// test/test-rri-parse.js
import fetch from 'node-fetch';
import 'dotenv/config';+

const BASE_URL = 'http://localhost:3000';
const USERNAME = process.env.KUBIOS_USERNAME;
const PASSWORD = process.env.KUBIOS_PASSWORD;

// 1. Kirjaudu sisään
const loginRes = await fetch(`${BASE_URL}/api/kubios/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: USERNAME, password: PASSWORD })
});
const { token } = await loginRes.json();

// 2. Hae mittauslista
const measuresRes = await fetch(`${BASE_URL}/api/kubios/measures?details=yes`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await measuresRes.json();

// 3. Etsi ensimmäinen pitkä RRI-mittaus
const measure = data.measures.find(m =>
  m.state === 'finalized' &&
  m.channels.some(ch => ch.type === 'RRI' && ch.data_url && ch.data_size > 10000)
);

const rriChannel = measure.channels.find(ch => ch.type === 'RRI' && ch.data_url);
const dataUrl = rriChannel.data_url;

// 4. Hae ja pura data
const response = await fetch(dataUrl);
const buffer = await response.arrayBuffer();
const view = new DataView(buffer);
const rriValues = [];
for (let i = 0; i < buffer.byteLength; i += 2) {
  rriValues.push(view.getUint16(i, true));
}

console.log('Datapisteitä:', rriValues.length);
console.log('Kesto tunteina:', (rriValues.reduce((a, b) => a + b, 0) / 1000 / 3600).toFixed(2));