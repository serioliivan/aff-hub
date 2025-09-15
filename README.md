# aff-hub (Vercel + Supabase) — Endpoint di uscita & Import report
Repo pronta per essere deployata su **Vercel**. Fornisce:
- `/api/go-tp`      → crea link affiliati Travelpayouts (marker + sub_id) e fa redirect 302
- `/api/go-stay22`  → costruisce link Stay22 (aid + campaign) e fa redirect 302
- `/api/import-travelpayouts` → importa prenotazioni TP (Aviasales/Hotellook) negli ultimi 60 giorni
- `/api/import-stay22`        → importa prenotazioni Stay22 negli ultimi 60 giorni
- `/api/import-all`           → chiama entrambi gli import con una sola URL
- `/api/health`               → semplice healthcheck

> **Sicurezza**: NON committare i tuoi segreti. Usa `.env.example` come riferimento e metti
> le variabili in Vercel → Project → Settings → Environment Variables.

## Variabili ambiente richieste (Vercel → Project Settings → Environment Variables)

### Travelpayouts
- `TP_MARKER` (il tuo marker / partner id)
- `TP_TRS` (project id)
- `TP_TOKEN` (API token)
- `TP_PROGRAM_ID_AVIASALES` (es. 100)
- `TP_PROGRAM_ID_HOTELLOOK` (es. 132)

### Stay22
- `STAY22_AID` (es. 'travirae')
- `STAY22_REPORT_TOKEN` (token reporting)
- `STAY22_REPORT_URL` (endpoint reporting che ricevi dal tuo Hub, es: https://api.stay22.com/reporting/v2)

### Supabase (server side)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Test veloci (dopo deploy)
- Apri `/api/health` → `{"ok":true}`
- Prova un redirect TP:
  ```
  /api/go-tp?target=https%3A%2F%2Fsearch.aviasales.com%2Fflights%2F%3Forigin_iata%3DMIL%26destination_iata%3DLON%26depart_date%3D2025-09-25%26adults%3D1&subid=marco01
  ```
- Prova un redirect Stay22:
  ```
  /api/go-stay22?address=rome%20italy&checkin=2025-09-25&checkout=2025-09-30&campaign=marco01
  ```

## Cron (GitHub Actions)
Questa repo include `.github/workflows/import.yml` per eseguire ogni notte gli import.
Imposta nei **Secrets** della repo:
- `IMPORT_TP_URL` = `https://<tuo-progetto-vercel>.vercel.app/api/import-travelpayouts`
- `IMPORT_STAY22_URL` = `https://<tuo-progetto-vercel>.vercel.app/api/import-stay22`

## Note
- Gli endpoint di import usano **ultimi 60 giorni** e fanno **upsert**.
- `go-*.js` loggano i click nella tabella `clicks` (serve schema su Supabase).
