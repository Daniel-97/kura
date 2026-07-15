<p align="center">
  <img src="frontend/public/kura-icon.svg" width="96" alt="Kura" />
</p>

# Kura — Libretto sanitario personale

Kura è un'applicazione web self-hosted per gestire il proprio libretto sanitario: referti e documenti medici, misurazioni (pressione, peso, glicemia), terapie e promemoria — tutto sul tuo server, mobile-first e installabile come app.

## Funzionalità

- **🗂 Diario clinico** — timeline dei referti con allegati (PDF e immagini) protetti da token temporanei, categorie personalizzabili con colori, ricerca full-text su titoli/note/tag, promemoria email per le visite
- **📊 Misurazioni** — diario della pressione con grafico (sistolica/diastolica/battiti), peso e glicemia con trend; nuovi parametri aggiungibili con una riga di configurazione
- **💊 Terapie e medicinali** — ricorrenze flessibili ("ogni giorno alle 8", "ogni 6 mesi"), scadenze delle confezioni con preavviso via email, notifiche per occorrenza attivabili per singola terapia
- **🏠 Panoramica** — dashboard con prossime visite e countdown, ultime misurazioni, terapie in corso e promemoria in attesa
- **📤 Export e portabilità** — export completo in ZIP (JSON fedele + CSV apribili in Excel + tutti gli allegati), export della singola visita, evento `.ics` da importare nel calendario
- **🌍 Esperienza** — bilingue italiano/inglese (preferenza salvata sul profilo), tema chiaro/scuro, installabile sul telefono (PWA), design system dedicato
- **🔒 Sicurezza e backup** — dati isolati per utente a livello di API, allegati mai raggiungibili senza autenticazione, backup automatici notturni con rotazione

## Prerequisiti

- **Node.js LTS** (v20+) per sviluppo e build locale
- **Docker** + **Docker Compose** — opzionale, per il deploy containerizzato

## Sviluppo locale

Il workflow è gestito da un `Makefile` (`make help` per l'elenco completo dei target):

```bash
make setup   # prima volta: scarica il binario PocketBase + npm install
make dev     # avvia backend (:8090) e frontend (:5173) insieme; Ctrl+C ferma entrambi
```

Apri http://localhost:5173. Il dev server fa proxy delle richieste `/api` e `/_` verso PocketBase (porta 8090).

L'admin UI di PocketBase è raggiungibile su http://localhost:8090/_/.

Altri target utili:

```bash
make backend      # solo PocketBase
make frontend     # solo Vite dev server
make check        # type-check + test
make build        # build di produzione → pb_public/
```

### Troubleshooting: `attempt to write a readonly database`

Succede quando i file in `pb_data/` appartengono a `root` (tipicamente perché il container Docker è stato eseguito come root in passato). Sistema con:

```bash
make fix-perms   # richiede sudo
```

Il `docker-compose.yml` ora esegue il container come il tuo utente (`KURA_UID`/`KURA_GID`, default `1000:1000`), quindi il problema non si ripresenta.

## Build e deploy manuale (senza Docker)

```bash
cd frontend && npm run build
```

I file statici vengono emessi in `pb_public/` (escluso da git). Sul server:

```bash
./scripts/setup.sh      # scarica il binario per l'OS/arch del server
./pocketbase serve --http=0.0.0.0:8090
```

PocketBase serve automaticamente il frontend da `pb_public/`.

## Deploy con Docker

```bash
make docker-up    # equivale a: KURA_UID=$(id -u) KURA_GID=$(id -g) docker compose up -d --build
```

- Dati persistenti in `./pb_data/` (bind mount automatico)
- Il container gira come il tuo utente (non root), così `pb_data/` resta scrivibile anche fuori da Docker. Se lanci `docker compose` a mano con un utente con UID diverso da 1000, esporta `KURA_UID` e `KURA_GID`.
- Per fermare: `make docker-down`
- Per i log: `make docker-logs`

### Deploy senza build locale (immagine pre-buildata)

Ogni release pubblica un'immagine multi-arch (amd64/arm64) su GitHub Container
Registry, pronta per il pull su Raspberry Pi/NAS senza compilare nulla:

```bash
docker pull ghcr.io/daniel-97/kura:1.0.0
```

Usa [`docker-compose.prod.yml`](docker-compose.prod.yml) come base — è identico
a `docker-compose.yml` ma punta a `image: ghcr.io/daniel-97/kura:X.Y.Z` invece
di buildare. **Tieni il tag pinnato a una versione precisa** (mai `:latest`):
un aggiornamento non richiesto su dati sanitari va deciso, non subìto.

Tag disponibili per ogni release `vX.Y.Z`: `X.Y.Z`, `X.Y`, `X` e `latest`
(quest'ultimo segue sempre l'ultima release, utile solo per controllare
manualmente "qual è la versione più recente"). I push su `main` pubblicano
anche `edge`, build di sviluppo non testate — da non usare in produzione.

### Versionamento e aggiornamenti

Le release seguono [Semantic Versioning](https://semver.org/lang/it/) e sono
taggate su Git come `vX.Y.Z`. Prima di aggiornare un'istanza, leggi sempre il
[CHANGELOG](CHANGELOG.md) della versione target: un MAJOR bump può richiedere
un passaggio manuale (es. wipe di `pb_data/`, come già capitato per i campi
`protected`/`thumbs`/`language` — vedi `docs/TODO.md`).

Procedura completa per rilasciare o aggiornare un'istanza (branching, tag,
cosa pubblica la CI): [`docs/RELEASING.md`](docs/RELEASING.md).

## Primo avvio: crea l'admin e l'utente

Con l'app in esecuzione (`make dev` in locale oppure `make docker-up`), esegui:

```bash
make seed
```

Lo script chiede interattivamente email e password per l'account admin (superuser PocketBase) e per il tuo utente personale, poi li crea automaticamente. Rileva da solo se usare il container Docker o il binario locale (forzabile con `SEED_MODE=docker|local`). Va eseguito una sola volta su un'istanza fresh.

Variabili d'ambiente opzionali:

| Variabile         | Default                  | Descrizione                              |
|-------------------|--------------------------|------------------------------------------|
| `ALLOW_REGISTRATION` | `true` | Imposta a `false` per disabilitare la registrazione di nuovi utenti. Controlla sia l'UI che l'API di PocketBase. Richiede `docker compose build` dopo il cambio. |
| `PB_URL`          | `http://localhost:8090`  | URL di PocketBase (es. host remoto)      |
| `PB_TIMEOUT`      | `60`                     | Secondi di attesa per l'health check     |
| `COMPOSE_SERVICE` | `kura`                   | Nome del service in `docker-compose.yml` |
| `SMTP_HOST`       | —                        | Host SMTP per invio promemoria email     |
| `SMTP_PORT`       | `587`                    | Porta SMTP                               |
| `SMTP_USERNAME`   | —                        | Utente SMTP                              |
| `SMTP_PASSWORD`   | —                        | Password SMTP                            |
| `SMTP_FROM`       | —                        | Indirizzo mittente (es. `noreply@kura.tld`) |
| `SMTP_FROM_NAME`  | `Kura`                   | Nome mittente                            |
| `APP_URL`         | `http://localhost:8090`  | URL pubblico dell'app                    |
| `BACKUP_CRON`     | `0 3 * * *`              | Backup automatico di `pb_data` (schedulazione cron); `off` per disabilitare |
| `BACKUP_MAX_KEEP` | `7`                      | Quanti backup tenere prima di ruotare    |

Al termine accedi all'app su **http://localhost:8090**.

Admin panel: **http://localhost:8090/_/**

## Backup

Kura esegue di serie un **backup automatico notturno** dell'intera `pb_data/` (database + allegati, ZIP atomico): di default ogni notte alle 3, tenendo gli ultimi 7. Schedulazione e retention si controllano con `BACKUP_CRON` / `BACKUP_MAX_KEEP` (tabella sopra; `BACKUP_CRON=off` disabilita).

- I backup finiscono in `pb_data/backups/`
- **Ripristino** (e backup manuali extra): dashboard admin → Settings → Backups
- Limite da conoscere: i backup vivono sullo **stesso disco** dei dati — coprono errori umani e software, non il guasto del disco. Per il disaster recovery includi `pb_data/backups/` (o l'intera `pb_data/`) nel backup dell'host.

Copia manuale al volo, se serve:

```bash
cp -r pb_data/ backup/pb_data_$(date +%Y%m%d_%H%M%S)/
```

## Sicurezza

Kura contiene dati sanitari sensibili. **Non esporre mai l'app su internet senza HTTPS.** Opzioni consigliate:

- Reverse proxy con TLS (Caddy, Nginx + Let's Encrypt)
- VPN privata per accesso personale (Tailscale, WireGuard)
