# Combat Tracker

Combat Tracker e' un'app Next.js per gestire iniziativa, HP, turni, incantesimi
e cronologia dei combattimenti. Autenticazione e persistenza sono gestite da
Supabase.

## Funzionalita'

- registrazione e login con email/password tramite Supabase Auth;
- catalogo privato dei personaggi gia' usati, con reinserimento rapido;
- salvataggi permanenti dei combattimenti completi;
- autosalvataggio ogni minuto dello slot attivo;
- isolamento dei dati per utente tramite Row Level Security.

## Avvio locale

Requisiti:

- Node.js 22.13 o successivo;
- un progetto Supabase con lo schema in `supabase/schema.sql`.

Installa le dipendenze:

```bash
npm install
```

Copia `.env.local.example` in `.env.local` e configura:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Usa esclusivamente una chiave pubblicabile nel frontend. Non inserire mai una
chiave `service_role` o una secret key in variabili `NEXT_PUBLIC_*`.

Avvia l'app:

```bash
npm run dev
```

Poi apri `http://localhost:3000`.

## Database e sicurezza

Lo schema crea:

- `saved_characters`, catalogo permanente dei personaggi dell'utente, con varianti
  distinte per nome/tipo/HP;
- `combat_saves`, snapshot JSON completi e senza scadenza automatica.

Entrambe le tabelle hanno RLS attiva. Le policy di lettura, inserimento,
aggiornamento ed eliminazione verificano sempre che `auth.uid()` coincida con
`user_id`. Il ruolo anonimo non ha accesso alle tabelle.

Il salvataggio resta nel database finche' l'utente non lo elimina
esplicitamente dall'app. La cartella `backend/` contiene il precedente backend
Django ed e' mantenuta solo come riferimento: il frontend corrente comunica
direttamente con Supabase.

## Verifica

```bash
npm test
npm run lint
npm run build
```
