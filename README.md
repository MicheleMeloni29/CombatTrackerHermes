# Todo App / Combat Tracker

Questo repository contiene:

- frontend Next.js in root
- backend Django in `backend/`
- configurazione Render in `render.yaml`

## Frontend

Per avviare il frontend:

```bash
npm install
npm run dev
```

Il frontend gira su `http://localhost:3000`.

## Backend Django

Dipendenze Python:

```bash
python -m pip install -r requirements.txt
```

Avvio locale:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Il backend gira su `http://localhost:8000`.

Variabili locali consigliate:

- frontend: [.env.local.example](.env.local.example)
- backend: [backend/.env.example](backend/.env.example)

## API disponibili

- `GET /api/health/`
- `GET /api/auth/csrf/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET /api/combats/`
- `POST /api/combats/`
- `GET /api/combats/<id>/`
- `PATCH /api/combats/<id>/`
- `DELETE /api/combats/<id>/`
- `POST /api/combats/<id>/activate/`
- `POST /api/combats/<id>/restore/`
- `POST /api/combats/<id>/autosave/`

## Modello dati

Il backend salva ogni combattimento come snapshot JSON validato server-side. Questo aderisce al modello già usato dal frontend:

- `characters`
- `currentTurnIndex`
- `round`
- `isCombatStarted`
- `log`

La scelta è intenzionale: permette di migrare velocemente dal `localStorage` al database senza riscrivere prima tutta la logica di gioco.

## Render

Il deploy Render è pronto in `render.yaml`.

### Set definitivo env vars

Frontend locale:

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`

Backend locale:

- `DJANGO_DEBUG=true`
- `SECRET_KEY=change-me-before-production`
- `ALLOWED_HOSTS=127.0.0.1,localhost`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- `CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- `SECURE_SSL_REDIRECT=false`
- `DATABASE_URL` opzionale; se assente usa `sqlite`

Backend Render:

- `DJANGO_DEBUG=false`
- `SECRET_KEY=<secret reale>`
- `ALLOWED_HOSTS=combattrackerhermes-backend.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://combat-tracker-hermes.vercel.app`
- `CSRF_TRUSTED_ORIGINS=https://combat-tracker-hermes.vercel.app`
- `SECURE_SSL_REDIRECT=true`
- `DATABASE_URL=<connection string postgres render>`

Esempio produzione: [backend/.env.render.example](backend/.env.render.example)

Il servizio usa:

- `gunicorn` come server WSGI
- PostgreSQL tramite `DATABASE_URL`
- `whitenoise` per static files

## Stato integrazione frontend

Il backend è pronto, ma il frontend corrente usa ancora `localStorage` e login hardcoded. Il passo successivo è sostituire:

- [components/SessionLoginGate.tsx](components/SessionLoginGate.tsx)
- [components/CombatContext.tsx](components/CombatContext.tsx)

con chiamate reali al backend Django.
