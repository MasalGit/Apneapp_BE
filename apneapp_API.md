# ApneApp API dokumentaatio

## Yleistä

Backend pyörii osoitteessa `http://localhost:3000`. Kaikki pyynnöt palauttavat JSON-muodossa.

Kirjautumista vaativat endpointit tarvitsevat `Authorization`-headerin jossa on JWT-token:
```
Authorization: Bearer <token>
```

---

## Endpointit

### 1. Kirjautuminen

```
POST /api/kubios/login
```

**Body:**
```json
{
  "username": "kayttaja@email.com",
  "password": "salasana"
}
```

**Vastaus:**
```json
{
  "message": "Logged in successfully with Kubios",
  "user": { ... },
  "user_id": 1,
  "token": "eyJh..."
}
```

Tallenna `token` — se tarvitaan kaikissa muissa pyynnöissä.

---

### 2. Mittaushistoria

```
GET /api/kubios/history
Authorization: Bearer <token>
```

**Vastaus:**
```json
{
  "results": [
    {
      "measure_id": "7f9903b6-6b5f-4dea-ba12-039670f6d094",
      "measured_at": "2026-04-26T18:54:39.000Z",
      "duration_s": 22752,
      "lfhf_avg": 1.045,
      "risk": "elevated"
    },
    {
      "measure_id": "0c0de340-622b-449a-ba2b-cf204a40aeab",
      "measured_at": "2026-03-24T19:31:50.000Z",
      "duration_s": 25841,
      "lfhf_avg": 0.945,
      "risk": "elevated"
    }
  ]
}
```

Tulokset ovat aikajärjestyksessä uusimmasta vanhimpaan.

**Kentät:**
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| measure_id | string | Mittauksen yksilöivä tunniste |
| measured_at | string | Mittausaika ISO8601-muodossa |
| duration_s | number | Mittauksen kesto sekunteina |
| lfhf_avg | number | LF/HF-suhteen keskiarvo |
| risk | string | Riskitaso: `normal`, `elevated` tai `high` |

---

### 3. Synkronointi

```
GET /api/kubios/sync
Authorization: Bearer <token>
```

Hakee uudet mittaukset Kubios Cloudista ja tallentaa ne tietokantaan. Käyttäjä painaa tätä manuaalisesti.

**Vastaus:**
```json
{
  "message": "Synkronointi valmis",
  "synced": 5,
  "skipped": 2
}
```

---

### 4. Käyttäjätiedot

```
GET /api/kubios/me
Authorization: Bearer <token>
```

**Vastaus:**
```json
{
  "user": {
    "user_id": 1,
    "username": "kayttaja@email.com",
    "email": "kayttaja@email.com"
  }
}
```

---

## Riskitasot

| risk | lfhf_avg | Merkitys |
|------|----------|----------|
| `normal` | alle 0.7 | Normaali |
| `elevated` | 0.7 – 1.2 | Kohonnut |
| `high` | yli 1.2 | Korkea |

Viitearvot perustuvat Hakala 2017 -tutkimukseen. Normaali yöuni LF/HF ~0.34, hypopnea ~1.55.

---

## Tyypillinen käyttöjärjestys

1. Käyttäjä kirjautuu sisään → `POST /api/kubios/login` → tallenna token
2. Käyttäjä painaa "Synkronoi" → `GET /api/kubios/sync`
3. Frontend hakee historian → `GET /api/kubios/history`
4. Frontend piirtää trendikuvaajan `measured_at` x-akselilla ja `lfhf_avg` y-akselilla