
import fetch from 'node-fetch';

const dataUrl = 'https://ew1-kub-prd-content.s3.amazonaws.com/measure/user-4cc31d1d-41db-4d5d-87c4-eb55519640ea/session-0c0de340-622b-449a-ba2b-cf204a40aeab/channel-001/final/data?AWSAccessKeyId=ASIA6DPVPCLZSRFAJDWR&Signature=vRYqENICxDnPhaqfaX0I7Jjq7YI%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEPz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMSJHMEUCIQC4Tl6h0L7W9ywGe0Y58Yv3AJYU9DYbI4V5tnVCj7oLOwIgVrenqg5eJVXzeQV4sYvMTfBW9BwoaYUbJHgESUwml3oq%2FwQIxf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARACGgw5Njk1NjY3ODYyOTEiDP0vVO2DkkNa0OlrMirTBCEyh53VzjyfSbSOhHywkJaFGIgklJdjxvtMWbIagg58vfwsCrqS4TBziHMdsB7zSeP91GuMPo1WJ72kTxlH6cDoX6zrUOF00o5vJBmUqN2tcc2%2F04jRJdLLefabf74irkZCRKbZH%2FxnEjaplI1B4YOmZDuqtaAssmQFDBeEbny8g4ZuFY%2BViDMzxCu8uRKOqsdPO%2BVDZ95ds9oeIw1ldbPU0ckl5UWCW0Ek2MUU3Ht1T41BsBY9kHldbNKv4ufTy%2FAwfUZ2qeCvbr50MiDZIkbO5EYiczky3Oxs3CMo6ML3QUHSPrmkyFXI2Z2PZP1thIvRdfjeh8jVUk9jv%2FzRZVfVa%2Bitpb99vdPTEMWjt16jM51UeyDtjp9TI8bsctNVEmcWcsvcq7s%2FCCAZMcNkHvNliIg%2Bbf1jatJpjkwZuPRBaZ5ylWuGEcWJq8wvzodQSaQbxqzaSXHpKSNVF7FVNi3oyvHX%2FtXZgqIlO8Ywyzox4G4eRBH0um%2F56skE6NGOx%2FLHOcyD9O7BTw6SUlTPMtpL9ThZFBGFAWRvkIQiSqU%2Fb6Ocz0GqEGn9FXpNk1HPCjHcTtj0joRs5jZC2W64OmtvyDeT2g99%2FZyCLU83auHCiBKR50boC3n3ZIjRa4BQugAgoXEG3Bt5pWr9upZBy6KJ7P2xAFQv9ffl3vS8ZGRnCc8yomcD%2F9WySTuNStMWyi3baPZynw0eUWx1q0zqjCmJBMjOLIofhtTUItXI0JKuMdVolGSbi6IG9yjmPBKOJshe1lmPCY3BG%2F5gNR3dCkkK5Ncw1pG9zwY6owFyzJHoVsNV%2F1hZkVFmDF7tA%2B6RPUNKkOTbNPqaLn6r7te6k9W0Kh8Kichr0Fgewk%2BYwHpbc%2BmGq8oY%2FwRa2Owt3H0J6kK2OjZBQru3xdf8Hyny3vG7WS1CdvPG0hMZ7ynXnN1rRSmsbZiSJAEhny5Pr%2FQAUKR6Dv7V%2FJNOtinLdFUPkLiVnFRGkxFiTPgt05iSu1OqUtUkICJtN8WX0RqmjtGU&Expires=1777295680';

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