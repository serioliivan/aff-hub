# DEPLOY_STEPS — Istruzioni click-by-click

## 1) Crea repository su GitHub
1. Vai su https://github.com/new → **Repository name**: `aff-hub`
2. Clicca **Create repository**
3. Clicca **Upload files** → trascina dentro **tutti i file** di questo ZIP → **Commit changes**

## 2) Deploy su Vercel (nuovo progetto)
1. Vai su https://vercel.com → **Add New… → Project**
2. Seleziona la repo `aff-hub` → **Import**
3. Alla schermata di configurazione:
   - Lascia i campi default (non serve build command)
   - Vai su **Environment Variables** e aggiungi (uno per riga):
     - `TP_MARKER` = 669407
     - `TP_TRS` = 454819
     - `TP_TOKEN` = cbd6c03b0dba76504e72be774de3657b
     - `TP_PROGRAM_ID_AVIASALES` = 100
     - `TP_PROGRAM_ID_HOTELLOOK` = 132
     - `STAY22_AID` = travirae
     - `STAY22_REPORT_TOKEN` = stay22_21e2ae0a-c844-4fe5-b090-275a240d57d5
     - `STAY22_REPORT_URL` = https://api.stay22.com/reporting/v2   (aggiorna se diverso nel tuo Hub)
     - `SUPABASE_URL` = https://uflxbtupncooisrunygj.supabase.co
     - `SUPABASE_SERVICE_ROLE_KEY` = [la tua chiave service role]
   - Clicca **Deploy**

4. Test immediato:
   - Apri `https://<tuo-progetto>.vercel.app/api/health` → deve rispondere `{"ok":true,...}`

## 3) Collega travirae.com agli endpoint (frontend)
**Salva il referral ?ref** (una sola volta, su qualsiasi pagina di ingresso):
```html
<script>
(function () {
  const u = new URL(location.href), ref = u.searchParams.get('ref');
  if (ref) {
    localStorage.setItem('ref', ref);
    document.cookie = "ref="+encodeURIComponent(ref)+";path=/;max-age="+(60*60*24*60);
  }
  window.getRef = () =>
    u.searchParams.get('ref') ||
    (document.cookie.match(/(?:^|; )ref=([^;]+)/)||[])[1] ||
    localStorage.getItem('ref') || '';
})();
</script>
```

**Voli (Aviasales via Travelpayouts):**
```js
function openAviasales({ origin, destination, depart, ret, adults=1, trip_class=0 }) {
  const ref = window.getRef?.() || '';
  const target = new URL('https://search.aviasales.com/flights/');
  target.search = new URLSearchParams({
    origin_iata: origin, destination_iata: destination,
    depart_date: depart,  return_date: ret || '',
    adults, trip_class
  }).toString();
  const url = `https://<tuo-progetto>.vercel.app/api/go-tp?target=${encodeURIComponent(target)}&subid=${encodeURIComponent(ref)}`;
  window.open(url, '_blank', 'noopener');
}
```

**Hotel (Stay22):**
```js
function openStay22({ address, lat, lng, checkin, checkout }) {
  const ref = window.getRef?.() || '';
  const p = new URLSearchParams();
  if (address) p.set('address', address);
  if (lat && lng) { p.set('lat', lat); p.set('lng', lng); }
  if (checkin) p.set('checkin', checkin);
  if (checkout) p.set('checkout', checkout);
  p.set('campaign', ref);
  window.open(`https://<tuo-progetto>.vercel.app/api/go-stay22?${p.toString()}`, '_blank', 'noopener');
}
```

## 4) Abilita gli import notturni (cron)
1. Su GitHub → repo `aff-hub` → **Settings → Secrets and variables → Actions → New repository secret**
   - `IMPORT_TP_URL` = `https://<tuo-progetto>.vercel.app/api/import-travelpayouts`
   - `IMPORT_STAY22_URL` = `https://<tuo-progetto>.vercel.app/api/import-stay22`
2. Vai su **Actions** → abilita i workflow → apri **nightly-imports** → **Run workflow** per test
3. D’ora in poi ogni notte alle 03:00 UTC importerà gli ultimi 60 giorni

## 5) Verifiche
- Su Supabase → `clicks`: dopo un click su “Vedi su …” compare una riga (`ref`, `network`, `target`)
- Su Supabase → `conversions_tp` e `conversions_stay22`: dopo l’import compaiono prenotazioni (pending/paid)
- Su Supabase → `views` → `aff_monthly`: vedi `revenue_paid`, `payout_rate` per influencer, `payout_due`

## 6) Modificare la percentuale di un influencer
- Su Supabase → **SQL**:
```sql
update public.influencers set payout_rate = 0.40 where ref='marco01';
```
(Le viste ricalcolano automaticamente il `payout_due` per i mesi coinvolti.)

## 7) Risoluzione problema “Function Runtimes must have a valid version”
- Questo pacchetto **non** include `vercel.json`. L’errore era causato da una config `functions.runtime` interpretata in modo legacy.
- Con `package.json` → `"engines": { "node": "22.x" }` Vercel usa Node 22 automaticamente per le Serverless Functions.
