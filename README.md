# Uniapnea riskin tunnistus sovellus — ApneApp Web App

Ryhmätyö Projekti: Terveyssovelluksen kehitys TX00EY13-3003

Terveyspäiväkirja on full stack -web-sovellus, jossa käyttäjä voi seurata terveyttään kirjaamalla päiväkirjamerkintöjä, verenpainemittauksia sekä laskemalla BMI-arvonsa. Sovellus on toteutettu Node.js/Express-backendillä ja Vite-pohjaisella HTML/CSS/JS-frontendillä.

---

## Ominaisuudet

- **Rekisteröityminen ja kirjautuminen** — JWT-pohjainen autentikaatio
- **Tietoturva** — käyttäjä näkee ja muokkaa vain omia tietojaan
- **Responsiivinen ulkoasu** — mobiili- ja työpöytänäkymä, omat grafiikat ja taustat

---

## Tietokannan rakenne

```sql
Users 
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50) NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Measurements 
  measure_id  VARCHAR(100) PRIMARY KEY,
  user_id     INT NOT NULL,
  measured_at DATETIME NOT NULL,
  duration_s  FLOAT,
  lfhf_avg    FLOAT,
  risk        VARCHAR(20),
  timeseries  JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  INDEX idx_user_measured (user_id, measured_at)
```

---

## Kuvakaappaukset



## Tekninen arkkitehtuuri

### Backend

| Kerros | Tiedostot |
|--------|-----------|
| Routes | `entry-router.js`, `bloodpressure-router.js`, `user-router.js` |
| Controllers | `entry-controller.js`, `bloodpressure-controller.js`, `user-controller.js` |
| Models | `entry-model.js`, `bloodpressure-model.js`, `user-model.js` |
| Middlewares | `authentication.js` (JWT), `logger.js` |
| Utils | `database.js` (mysql2-pool) |

**Teknologiat:** Node.js (ESM), Express.js, MariaDB/MySQL, bcryptjs, jsonwebtoken, express-validator

### Frontend

| Sivu | Kuvaus |
|------|--------|
| `index.html` | Etusivu |
| `login.html` | Kirjautuminen ja rekisteröityminen |
| `paivakirja.html` | Päiväkirjamerkintöjen CRUD, korttinäkymä |
| `verenpaine.html` | Verenpainemittausten CRUD ja suodatus |
| `bmi.html` | BMI-laskuri (perinteinen + Trefethen) |

**Teknologiat:** Vite (multi-page build), Vanilla JS (ESM), CSS (Flexbox, CSS-muuttujat, mediakyselyt)

---

## API-endpointit

```
POST   /api/users/login             Kirjautuminen, palauttaa JWT-tokenin
POST   /api/users                   Rekisteröityminen

```

Kaikki suojatut reitit vaativat otsikossa: `Authorization: Bearer <token>`

---

## Asennus ja käynnistys

### Backend

```bash
cd BE
npm install
cp .env.sample .env
# Täytä .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm run dev
```

### Frontend

```bash
cd FE
npm install
npm run dev       # kehityspalvelin
npm run build     # tuotantobuild -> dist/
```

### Tietokanta

```bash
mysql -u käyttäjä -p tietokanta < db/health-diary-db.sql
```

---

## Julkaisu (users.metropolia.fi)

Frontend on julkaistu Metropolian palvelimella. Backend käynnistetään paikallisesti esittelytilaisuudessa:

```bash
cd BE && npm run dev
```

---

## Käytetyt lähteet ja AI:n hyödyntäminen

### Lähteet

- [Express.js dokumentaatio](https://expressjs.com/)
- [Vite dokumentaatio](https://vitejs.dev/)
- [express-validator](https://express-validator.github.io/)
- [jsonwebtoken](https://github.com/auth64/node-jsonwebtoken)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [MDN Web Docs — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs — CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout)
- Trefethenin BMI-kaava: [Nick Trefethen, Oxford (2013)](https://people.maths.ox.ac.uk/trefethen/bmi.html)

### AI:n hyödyntäminen

Projektissa on hyödynnetty tekoälyä (Claude Anthropic ja ChatGPT) seuraavissa kohdissa:

- Backend-rakenne ja MVC-arkkitehtuurin suunnittelu
- Express-validator-validointisääntöjen kirjoittaminen
- Frontend-komponenttien (kortit, snackbar, dialog) toteutus
- BMI-laskurin Trefethen-kaavan implementointi
- vite.config.js multi-page-konfiguraatio
- README.md:n kirjoittaminen

**Koodikommenteissa** AI:n tuottamat tai sen avulla kirjoitetut osuudet on merkitty kommentilla `// AI-assisted`.

Opiskelija on tarkistanut, ymmärtää ja osaa selittää kaiken koodissa olevan logiikan.

---

## Linkit

- 🌐 Julkaistu sovellus: https://users.metropolia.fi/~henrijja/HYTE-kevat-26/Frontend/
- 📁 Frontend-repo: https://github.com/Hege3000/frontend-vite/tree/week8-palautus
- 📁 Backend-repo: https://github.com/Hege3000/backend/tree/week8-palautus
