# aff-hub (Vercel + Supabase)
Endpoint di uscita e import report per Travelpayouts e Stay22.
Questo pacchetto **non** include `vercel.json` per evitare l'errore "Function Runtimes must have a valid version".
Vercel userà automaticamente Node.js **22** grazie a `engines` in `package.json`.

## API incluse
- `GET /api/health` – healthcheck
- `GET /api/go-tp?target=...&subid=...` – crea link affiliato Travelpayouts (marker + sub_id) e 302 redirect
- `GET /api/go-stay22?...` – costruisce link Stay22 (aid + campaign) e 302 redirect
- `POST /api/import-travelpayouts` – importa Aviasales+Hotellook (ultimi 60 giorni)
- `POST /api/import-stay22` – importa Stay22 (ultimi 60 giorni)
- `POST /api/import-all` – lancia entrambi gli import

## Ambiente (imposta in Vercel → Project → Settings → Environment Variables)
TP_MARKER, TP_TRS, TP_TOKEN, TP_PROGRAM_ID_AVIASALES, TP_PROGRAM_ID_HOTELLOOK
STAY22_AID, STAY22_REPORT_TOKEN, STAY22_REPORT_URL
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
