# Ribolov BiH - Bosnia and Herzegovina Fishing Assistant MVP

Vrhunska web aplikacija i asistent za ribolov u Bosni i Hercegovini koja kombinuje uživo vremenske podatke sa servisa **Open-Meteo**, astronomske i solunarne proračune (SunCalc), te autentičnu lokalnu bazu rijeka, jezera i ribljih vrsta BiH.

---

## 🌲 Dizajn i Estetika
Aplikacija je kreirana prema prirodnoj tematici riječnih tokova i jezera:
- **Šema boja**: Duboke šumske i riječno zelene nijanse (`#07130e`, `#0e2017`, `#10b981`), tamno plavi tonovi jezerske vode (`#0b1d2e`, `#0ea5e9`), te zlatni/bronzani solunarni akcenti (`#f59e0b`).
- **Izbjegnute generičke boje**: Bez umjetnih neon-ljubičastih ili sajt-slop efekata.
- **Tipografija i Interfejs**: Visoka čitljivost uz staklene (glassmorphism) kartice, mikro-animacije i mobilni odziv.

---

## ⚡ Tehnološki Stog
- **Okvir**: Next.js 14+ (App Router) & TypeScript
- **Stilizovanje**: Tailwind CSS & Lucide React ikone
- **Vremenska prognoza**: Open-Meteo Weather API (`https://api.open-meteo.com/v1/forecast`) & Open-Meteo Geocoding API
- **Astronomija & Mjesečina**: `suncalc` npm paket
- **Interaktivna Karta**: Leaflet & React-Leaflet (SSR-safe dynamic import)
- **Baza podataka**: Lokalni JSON seed sistem + spremna `supabase/schema.sql` PostgreSQL baza.

---

## 📊 Algoritam Ocjene Ribolovnih Uslova (`calculateFishingScore`)

Ocjena od **0 do 100** izračunava se dinamički za svaku ribu pojedinačno na osnovu sljedećih pondera:

1. **Temperatura zraka vs Temperatura vode (Ponder ~20%)**
   - Upoređuje se s optimalnim rasponom vrste (`optimal_min` / `optimal_max`).
   - *Napomena*: Aplikacija eksplicitno naglašava da temperatura zraka nije jednaka temperaturi vode.
2. **Atmosferski Pritisak i 6h Trend (Ponder ~25%)**
   - Prati se promjena pritiska: `pressure_now - pressure_6_hours_ago`.
   - Brzi pad pritiska (npr. -2 do -6 hPa / 6h) aktivira povećan odziv kod grabljivica (Štuka, Smuđ, Som).
3. **Dio Dana i Solunarni Periodi (Ponder ~15%)**
   - Vrhunci hranjenja tokom svitanja (05:30 - 08:30) i sumraka (18:00 - 21:00).
4. **Vjetar i Oblačnost (Ponder ~20%)**
   - Prilagođeno sklonostima vrsta (npr. Štuka preferira oblačno s valovanjem, Lipljen mirniju površinu).
5. **Padavine (Ponder ~5%)**
   - Lagana kiša povećava kisik u vodi, olujno nevrijeme smanjuje ocjenu.
6. **Sezona i Mjesečeva Faza (Ponder ~15%)**
   - Utjecaj punog mjeseca i proljetno/jesenjih perioda.

---

## 🗄️ Baza Podataka & Supabase Setup

Lokalni podaci se nalaze u folderu `data/`:
- `data/fish.json`: 20+ autentičnih slatkovodnih vrsta BiH.
- `data/waters.json`: Major rijeke i jezera BiH s tačnim GPS koordinatama.
- `data/relations.json`: Zastupljenost ribljih vrsta po vodama.
- `data/sources.json`: Verificirani izvori (FBiH Zakon o slatkovodnom ribarstvu, SRS BiH, NP Drina, NP Una).
- `data/rules.json`: Službene minimalne mjere, lovostaj i ograničenja ulova.

Za prelazak na **Supabase PostgreSQL**:
1. Kreirajte novi projekt na Supabase.
2. Otvorite SQL Editor i izvršite sadržaj datoteke `supabase/schema.sql`.
3. Importujte JSON podatke iz `data/` u odgovarajuće tabele.

---

## 🚀 Pokretanje Projekta Lokalno

```bash
# 1. Instalacija zavisnosti
npm install

# 2. Pokretanje razvojnog servera
npm run dev

# 3. Otvorite u pregledniku
http://localhost:3000
```

---

## ➕ Dodavanje Novih Vrsta i Voda

Za dodavanje nove vode ili ribe dovoljno je dopuniti odgovarajući fajl u `data/fish.json` ili `data/waters.json` sa obaveznim poljem `source_id` koje upućuje na validan izvor u `data/sources.json`.
