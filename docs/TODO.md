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

- [x] **Export dati**
  - [x] Export completo: "Esporta i miei dati" nel menu utente → ZIP client-side (`fflate`) con ogni collezione in JSON fedele + CSV semplificato (relazioni risolte) e allegati in cartelle per referto (design in `docs/superpowers/specs/2026-07-13-data-export-design.md`, non tracciato)
  - [x] Export della singola visita: voce "Esporta" nel menu della card → ZIP con `referto.json` + `referto.csv` + allegati
  - [x] ICS calendario: voce "Aggiungi al calendario" nel menu della card → `.ics` a evento singolo (RFC 5545, durata default 1h); scelta per-visita invece dell'export globale delle future

- [x] **Dashboard iniziale** *(fatto: `/` è la nuova home "Panoramica" con azioni rapide, prossime 3 visite con countdown, ultima pressione + trend 30 giorni, promemoria pendenti; la timeline è su `/timeline`. Include la fondazione del design system: token shadcn rimappati su `docs/design-system.md`, font Outfit/Inter/JetBrains Mono self-hosted, palette kura, ombre verdi, raggi; icone nav passate da emoji a Lucide)*

- [x] **Allineamento strutturale al design system** *(fatto: card senza bordo sinistro colorato §5.2, ribbon "oggi" sul primario invece del rosa §1, stato attivo sidebar su tinta chiara §5.4, bottom bar mobile a 4 voci al posto di hamburger+drawer §5.4, empty state timeline con firma ECG §5.5, date metadati in mono §3; `design-system.md` tracciato in git)*

- [x] **Parametri vitali generici** *(fatto: collezione `measurements` con discriminatore `type` — peso e glicemia; `blood_pressure` resta separata perché multi-valore; multi-profilo deciso NO — single utente per account. Pagina "Misurazioni" con tab Pressione/Peso/Glicemia, config per tipo nel frontend, export esteso con `misurazioni.json/csv`, redirect da `/blood-pressure`. Istanze esistenti: wipe + `make seed` o collezione manuale dal dashboard)*

- [x] **Dashboard: blocco misurazioni generico** *(fatto: la card è ora "Misurazioni recenti" — pressione con grafico + ultimo peso e ultima glicemia con data, righe nascoste se il tipo non ha dati. Tipi aggiuntivi (SpO2, temperatura) = un valore nel select di `init.js` + una entry in `measurementTypes.ts`)*

- [ ] **Promemoria ricorrenti / terapie**
  Oggi i reminder sono one-shot legati a un record. Aggiungere una sezione farmaci/terapie con ricorrenze ("ogni mattina", "richiamo tra 5 anni").

## 3. Idee più grosse (se il progetto cresce)

- [x] ~~**Multi-profilo (familiari)**~~ *(deciso NO il 2026-07-13 durante il design delle misurazioni: ogni persona ha il proprio login, PocketBase isola già per utente. Se mai servirà, sarà una migrazione dedicata)*

- [ ] **PWA / offline**
  Manifest + service worker per installare l'app sul telefono. L'UI è già mobile-first.

- [x] **Anteprime allegati** *(ridimensionato dopo brainstorming: solo thumbnail server-side `160x160` per i tile immagine — prima scaricavano l'originale intero; verificato 389KB→25KB e 404 senza token. Viewer PDF scartato: il browser lo fa già bene, pdf.js sarebbe una dipendenza pesante per nulla. Nota: `thumbs` va dichiarato sul campo file in `init.js` — istanze esistenti: solito wipe o toggle manuale)*

- [ ] **Backup automatici**
  Sfruttare l'API di backup schedulabile di PocketBase; cron di backup + rotazione nel docker-compose.
