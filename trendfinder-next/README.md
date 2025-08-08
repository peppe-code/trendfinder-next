# TrendFinder Next.js (ready-to-run)

App pronta per cercare **prodotti in trend** da Google Trends e Amazon Best Sellers, con:
- UI reattiva (filtri, grafico Recharts)
- API **/api/google-trends** (server) usando `google-trends-api`
- API **/api/amazon-best** (server) usando **SerpAPI** (opzionale, con fallback mock)
- Export CSV e copia JSON
- (Opzionale) salvataggio su Supabase di ogni scansione

## Avvio rapido
```bash
npm i
cp .env.example .env  # opzionale: compila le chiavi
npm run dev
```
Apri http://localhost:3000

## Variabili .env
- `SERPAPI_API_KEY` (opzionale): per `/api/amazon-best`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (opzionali): abilitano il salvataggio scansioni.

## Supabase (opzionale)
Crea tabella:
```sql
create table if not exists trend_scans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  query text,
  geo text,
  results jsonb
);
```
Rendi la tabella leggibile/scrivibile con la policy RLS per anon (solo insert/read).

## Note
- Se mancano le chiavi, le API rispondono con **mock di fallback** così puoi usare l'app subito e condividerla.

---

## Condividere e Deploy (1–2 minuti)

### Opzione A) **Carica lo ZIP su GitHub** e condividi il link
1. Vai su GitHub → New Repository → *trendfinder-next* (pubblico).
2. Carica i file del progetto (trascina lo ZIP scompattato).
3. Condividi l'URL del repo con chi vuoi.

### Opzione B) **Deploy 1‑click su Vercel**
1. Fai il passo A (repo su GitHub).
2. Apri https://vercel.com/new → **Import Git Repository** → seleziona il repo.
3. In **Environment Variables**, aggiungi se vuoi:

   - `SERPAPI_API_KEY` (per Amazon Best Sellers)

   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (facoltativi)

4. **Deploy**. Il link (es. `https://trendfinder-yourname.vercel.app`) è subito condivisibile.

> Consiglio: aggiungi un badge nel README del tuo repo per “Deploy with Vercel”:

> `[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<URL_DEL_TUO_REPO>)`

> Sostituisci `<URL_DEL_TUO_REPO>` con l'URL Git del tuo repository.

### Opzione C) Condividere lo ZIP
- Comprimi la cartella `trendfinder-next` e inviala via Drive/WeTransfer/Telegram.
- Chi riceve fa `npm i && npm run dev` ed è online in locale.

