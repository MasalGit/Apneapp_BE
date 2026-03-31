# ApneApp — Sleep Monitoring Web Application

Projekti: Terveyssovelluksen kehitys

ApneApp on web-sovellus, jonka tavoitteena on auttaa käyttäjää seuraamaan unen laatua ja tunnistamaan mahdollinen uniapneariski varhaisessa vaiheessa. Sovelluksessa hyödynnetään backend-rajapintaa (Node.js + Express) sekä myöhemmin toteutettavaa frontend-käyttöliittymää.

Tämä repository toimii ApneApp-projektin backend-pohjana, jota kehitetään ja muokataan projektin edetessä.

---

## Ominaisuudet

* **Rekisteröityminen ja kirjautuminen** — JWT-pohjainen autentikaatio
* **Datan käsittely** — backend-reitit käyttäjätiedoille, merkinnöille ja verenpainemittauksille
* **Tietoturva** — suojatut reitit vaativat tunnistautumisen
* **Laajennettava rakenne** — reitit, controllerit, middlewaret ja mallit eroteltu selkeästi
* **Testi- ja health-endpointit** — backendin toiminnan nopeaan tarkistamiseen

---

## Tekninen arkkitehtuuri

### Backend

| Kerros      | Tiedostot                                                                          |
| ----------- | ---------------------------------------------------------------------------------- |
| Routes      | `entry-router.js`, `bloodpressure-router.js`, `user-router.js`, `health-router.js` |
| Controllers | `entry-controller.js`, `bloodpressure-controller.js`, `user-controller.js`         |
| Models      | `entry-model.js`, `bloodpressure-model.js`, `user-model.js`                        |
| Middlewares | `authentication.js`, `logger.js`, `error-handlers.js`                              |
| Utils       | `utils/`                                                                           |

**Teknologiat:** Node.js (ESM), Express.js, MariaDB/MySQL, bcryptjs, jsonwebtoken, express-validator

### Frontend

Frontend toteutetaan erillisessä repositoriossa Figma-suunnitelmien pohjalta ja yhdistetään backendiin projektin myöhemmässä vaiheessa.

---

## API-endpointit

```text
POST   /api/users/login             Kirjautuminen, palauttaa JWT-tokenin
POST   /api/users                   Rekisteröityminen

GET    /api/entries                 Omat merkinnät
POST   /api/entries                 Uusi merkintä
GET    /api/entries/:id             Yksittäinen merkintä
PUT    /api/entries/:id             Päivitä merkintä
DELETE /api/entries/:id             Poista merkintä

GET    /api/bloodpressure           Verenpainemittaukset
POST   /api/bloodpressure           Uusi mittaus
GET    /api/bloodpressure/:id       Yksittäinen mittaus
PUT    /api/bloodpressure/:id       Päivitä mittaus
DELETE /api/bloodpressure/:id       Poista mittaus

GET    /api/health                  Tarkistaa, että backend toimii
GET    /api/health/test             Testireitti backendin toiminnan varmistamiseen
```

Kaikki suojatut reitit vaativat otsikossa: `Authorization: Bearer <token>`

---

## Asennus ja käynnistys

### Backend

```bash
npm install
npm run dev
```

Jos `npm run dev` ei toimi, voidaan käyttää myös:

```bash
node src/index.js
```

---

## Kehityksen nykytila

Backend-pohja on käytössä ja sitä muokataan ApneApp-projektin tarpeisiin. Frontendin lopullinen toteutus ja backend–frontend-yhdistäminen tehdään myöhemmissä vaiheissa.

---

## Käytetyt lähteet ja AI:n hyödyntäminen

### Lähteet

* Express.js dokumentaatio
* express-validator dokumentaatio
* MDN Web Docs

### AI:n hyödyntäminen

Tekoälyä on hyödynnetty oikoluvussa, rakenteen suunnittelussa sekä yksinkertaisten backend-osuuksien ideoinnin tukena. Opiskelijat tarkistavat ja ymmärtävät kaiken projektiin lisättävän koodin.

---

## Linkit

* Frontend-repo: https://github.com/MasalGit/Apneapp_FE
* Backend-repo: https://github.com/MasalGit/Apneapp_BE
