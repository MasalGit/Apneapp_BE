
import fetch from 'node-fetch';

const dataUrl = '';

const response = await fetch(dataUrl);
const buffer = await response.arrayBuffer();
const view = new DataView(buffer);
const rriValues = [];

for (let i = 0; i < buffer.byteLength; i += 2) {
  rriValues.push(view.getUint16(i, true));
}

console.log('Datapisteitä:', rriValues.length);
console.log('Ensimmäiset 10 arvoa:', rriValues.slice(0, 10));
console.log('Kesto sekunteina:', rriValues.reduce((a, b) => a + b, 0) / 1000);
console.log('Kesto tunteina:', (rriValues.reduce((a, b) => a + b, 0) / 1000 / 3600).toFixed(2));