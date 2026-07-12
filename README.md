# Kura — Libretto sanitario personale

Kura è un'applicazione web self-hosted per gestire il proprio libretto sanitario: referti medici, visite, esami, e diario della pressione arteriosa.

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

Al termine accedi all'app su **http://localhost:8090**.

Admin panel: **http://localhost:8090/_/**

## Backup

Tutti i dati si trovano nella cartella `pb_data/`. Backup manuale:

```bash
cp -r pb_data/ backup/pb_data_$(date +%Y%m%d_%H%M%S)/
```

## Sicurezza

Kura contiene dati sanitari sensibili. **Non esporre mai l'app su internet senza HTTPS.** Opzioni consigliate:

- Reverse proxy con TLS (Caddy, Nginx + Let's Encrypt)
- VPN privata per accesso personale (Tailscale, WireGuard)
