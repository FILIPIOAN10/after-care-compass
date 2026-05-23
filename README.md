# After — asistent digital pentru perioada de după o pierdere

**After** este o aplicație web full‑stack care ghidează familiile din România,
pas cu pas, prin procesul legal și administrativ care urmează unui deces.
Tonul aplicației este blând, calm și nu seamănă cu un site guvernamental.

Aplicația are două părți:

- **Frontend** (`src/`) — React 19 + Vite + Tailwind v4 + TanStack Router,
  servită cu TanStack Start (rulează inclusiv pe Cloudflare Workers).
- **Backend** (`backend/`) — REST API în **Java 21 / Spring Boot 3** cu
  autentificare JWT, JPA + H2 (în memorie) pentru dezvoltare, suport opțional
  pentru PostgreSQL, încărcare de fișiere pe disc.

UI‑ul este în limba română.

---

## Funcționalități

| Modul          | Frontend                                            | Backend                                                       |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| Cont           | Înregistrare, autentificare, 2FA (mock dev), logout | `POST /api/auth/register`, `/login`, `/2fa/verify`, `GET /me` |
| Chestionar     | Onboarding în 4 pași, creează dosarul familiei      | `POST /api/cases/me/onboarding` — generează sarcini personalizate |
| Plan de sarcini | Listă grupată pe etape, schimbare status, notițe   | `GET /api/tasks`, `PATCH /api/tasks/{id}/status\|note`        |
| Documente      | Încărcare, listare, descărcare, ștergere, filtrare  | `POST/GET/DELETE /api/documents`, `GET /{id}/download`        |
| Familie        | Invitații cu rol, eliminare acces, status invitație | `GET/POST/DELETE /api/family/members`                         |
| Traducător     | Chat care explică termeni birocratici în RO         | `POST /api/translator`, `GET /api/translator/suggestions`     |
| Jurnal         | Listă imutabilă a evenimentelor din dosar           | `GET /api/activity?limit=N`                                   |

Tot ce a fost static înainte (sarcini, documente, persoane, jurnal) este acum
salvat în baza de date și actualizat în timp real prin TanStack Query.

---

## Pornire rapidă (dezvoltare locală)

Ai nevoie de **Java 21** și **bun** (sau `npm`). **Maven nu trebuie instalat**
— folosește scripturile `mvnw` / `mvnw.cmd` din `backend/`.

### 1. Pornește backend‑ul

**Linux / macOS:**
```bash
cd backend
./mvnw spring-boot:run
```

**Windows (PowerShell):**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API‑ul rulează implicit pe `http://localhost:8090`.
Prima rulare descarcă automat Maven 3.9 (≈10 MB) și dependențele Spring Boot.
Datele sunt în H2 in‑memory — se șterg la repornire.
Documentele încărcate sunt scrise în `backend/uploads/`.

### 2. Pornește frontend‑ul

În alt terminal:

```bash
bun install     # sau: npm install
bun run dev     # sau: npm run dev
```

Vite servește pe `http://localhost:8080`.

> Dacă vrei să schimbi adresa backend‑ului, copiază `.env.example` în
> `.env.local` și actualizează `VITE_API_URL`.

### 3. Folosește aplicația

1. Deschide `http://localhost:8080`.
2. Apasă **Autentificare → Cont nou** și creează un cont.
3. Completează **chestionarul** — vei primi un plan personalizat de ~10–14 sarcini.
4. Încarcă documente, schimbă statusul sarcinilor, invită membri ai familiei,
   întreabă traducătorul.

> **Cod 2FA**: în dezvoltare orice 6 cifre merg (ex. `123456`).

---

## Configurare backend

Toate setările sunt în `backend/src/main/resources/application.yml` și pot fi
suprascrise prin variabile de mediu:

| Variabilă      | Implicit                                | Descriere                                         |
| -------------- | --------------------------------------- | ------------------------------------------------- |
| `PORT`         | `8090`                                  | Portul HTTP                                       |
| `JWT_SECRET`   | placeholder (cel puțin 32 caractere)    | Secretul folosit pentru semnarea JWT‑urilor       |
| `UPLOADS_DIR`  | `./uploads`                             | Unde se salvează fișierele                        |
| `CORS_ORIGINS` | localhost:5173/8080/8081/8787           | Origini permise pentru CORS                       |

### PostgreSQL (opțional)

```bash
SPRING_PROFILES_ACTIVE=postgres \
DB_URL=jdbc:postgresql://localhost:5432/after \
DB_USERNAME=after DB_PASSWORD=after \
./mvnw -pl backend spring-boot:run
```

---

## Build pentru producție

```bash
# Backend (un singur jar runnable)
cd backend && ./mvnw -DskipTests package
java -jar target/after-api-0.1.0.jar

# Frontend (static + Cloudflare Worker)
bun run build
```

---

## Structură

```
.
├── backend/                 # Spring Boot API
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd      # Maven Wrapper — nu necesită Maven instalat
│   └── src/main/java/ro/after/api/
│       ├── auth/            # User, JWT, AuthController
│       ├── case_/           # Dosarul familiei + onboarding
│       ├── task/            # Sarcini + template generator
│       ├── document/        # Upload/download fișiere
│       ├── family/          # Invitații + roluri
│       ├── activity/        # Jurnal de evenimente
│       ├── translator/      # Dicționar de termeni birocratici RO
│       ├── config/          # Spring Security, JWT, CORS, storage
│       └── common/          # CurrentUser, ApiException, handlers
├── src/                     # Frontend TanStack Start
│   ├── lib/api.ts           # Client REST + tipuri
│   ├── lib/auth.tsx         # Auth context (JWT în localStorage)
│   ├── routes/              # index, onboarding, dashboard, documents, family, translator, security
│   └── components/site/     # Header, Footer, PageShell, Logo
└── README.md
```

---

## Note de securitate

- Autentificarea în doi pași este implementată ca **mock** în dezvoltare
  (`POST /api/auth/2fa/verify` acceptă orice cod din 6 cifre). Înainte de
  producție, integrează un furnizor real (SMS, TOTP sau email OTP) și
  păstrează codul ca metaforă vizuală.
- Parolele sunt hash‑uite cu BCrypt.
- Documentele sunt salvate pe disc cu nume aleatorii; metadatele și
  legăturile cu utilizatorul sunt în baza de date.
- Datele dosarului sunt izolate strict pe utilizator — orice cerere
  încrucișată întoarce 403.
