# Kura — Fix e funzionalità da fare

Elenco emerso dalla revisione del 2026-07-12. Ordinato per priorità.

## 1. Sicurezza e robustezza (da fare prima)

- [x] **Proteggere gli allegati dei referti** *(fatto: `protected: true` sul campo `file` in `init.js` + file token in `RecordCard` via hook `useFileToken`; le istanze esistenti richiedono wipe di `pb_data/` o toggle manuale dal dashboard)*
  Il campo `file` della collezione `records` (`pb_migrations/init.js`) non ha `protected: true`: in PocketBase i file sono pubblici di default, quindi chiunque conosca l'URL può scaricare un referto senza autenticazione. Fix: marcare il campo come protetto e usare i file token (`pb.files.getToken()`) nel frontend per generare gli URL di download.

- [x] **Hook PocketBase mai caricati** *(scoperto e corretto durante il fix dei promemoria: PocketBase carica solo `pb_hooks/*.pb.js`, i file erano `.js` — promemoria, SMTP da env e toggle registrazione non sono mai stati attivi. Rinominati in `.pb.js`; corretto anche `$os.getEnv` → `$os.getenv` e il filtro `sent_at` che, essendo un oggetto DateTime truthy anche da vuoto, scartava tutti i promemoria)*

- [x] **Bug email promemoria: mostra l'ID categoria invece del nome** *(fatto: la relazione viene risolta con `findRecordById("categories", ...)`; riga "Categoria" omessa se il referto non ha categoria)*

- [x] **Email promemoria: escaping HTML mancante** *(fatto: `escapeHtml` su titolo, categoria, descrizione e messaggio nella parte HTML; il text/plain resta volutamente crudo. Corretto anche il `catch` del dispatcher che usava `reminder.getId()` — inesistente nel JSVM — e quindi mascherava gli errori reali. Nota JSVM: gli handler girano in VM separate, gli helper vanno definiti dentro il callback)*

- [x] **Email promemoria: lingua hardcoded it-IT** *(fatto: campo `language` (select it/en) su `users` in `init.js`; il LanguageSwitcher persiste la scelta sul profilo e al login la lingua salvata viene applicata; email tradotta it/en con date formattate a mano — il JSVM ignora `toLocaleDateString`. Le istanze esistenti richiedono wipe di `pb_data/` o aggiunta manuale del campo dal dashboard; senza campo l'email resta in italiano. Nota: l'orario nell'email usa il fuso del server)*

- [x] **Query promemoria inefficiente nel cron** *(fatto insieme al fix del filtro `sent_at`: il dispatcher ora usa `findRecordsByFilter("reminders", "sent_at = '' && fire_at <= {:now}", ...)` — selezione lato DB)*

- [x] **Filtri record non sanitizzati** *(fatto: `buildFilter` in `useRecords.ts` e il filtro in `useReminders.ts` usano `pb.filter()`; verificato e2e che un tag ostile non inietta più clausole — prima un valore come `x" || user != "` faceva tornare tutti i record. La `listRule` per-utente impediva comunque leak cross-utente)*

- [x] **Timeline troncata a 500 record** *(fatto: `useRecords` è una `useInfiniteQuery` a pagine da 100 con helper `nextPageParam` testato; la Timeline carica le pagine successive automaticamente con un sentinel `IntersectionObserver` in fondo alla lista)*

## 2. Funzionalità ad alto valore, sforzo contenuto

- [x] **Ricerca full-text sui referti** *(fatto: casella di ricerca con debounce 300ms nella timeline, filtro `(title ~ q || description ~ q || tags ~ q)` combinabile col select categoria; il vecchio filtro per tag è stato rimosso perché ridondante — i tag sono coperti dalla ricerca)*

- [ ] **Export dati**
  - ZIP con referti + allegati (portabilità, utile da portare dal medico)
  - CSV delle misurazioni della pressione
  - Export ICS delle visite future da importare nel calendario

- [ ] **Dashboard iniziale**
  Home con vista d'insieme: prossime visite, promemoria attivi, trend recente della pressione. Oggi la home è direttamente la timeline.

- [ ] **Parametri vitali generici**
  Generalizzare `blood_pressure` in una collezione "misurazioni" (peso, glicemia, saturazione, …) riusando lo stesso pattern grafico + form.

- [ ] **Promemoria ricorrenti / terapie**
  Oggi i reminder sono one-shot legati a un record. Aggiungere una sezione farmaci/terapie con ricorrenze ("ogni mattina", "richiamo tra 5 anni").

## 3. Idee più grosse (se il progetto cresce)

- [ ] **Multi-profilo (familiari)**
  Gestire i libretti di figli/genitori dallo stesso account. Richiede un campo `profile` su tutte le collezioni: meglio decidere presto perché tocca lo schema.

- [ ] **PWA / offline**
  Manifest + service worker per installare l'app sul telefono. L'UI è già mobile-first.

- [ ] **Anteprime allegati**
  Thumbnail per le immagini (PocketBase le genera con `?thumb=`) e viewer PDF inline invece del solo download.

- [ ] **Backup automatici**
  Sfruttare l'API di backup schedulabile di PocketBase; cron di backup + rotazione nel docker-compose.
