# Kura — Libretto sanitario personale

Kura è un'applicazione web self-hosted per gestire il proprio libretto sanitario: referti medici, visite, esami, e diario della pressione arteriosa.

## Prerequisiti

- **Node.js LTS** (v20+) per sviluppo e build locale
- **Docker** + **Docker Compose** — opzionale, per il deploy containerizzato

## Setup sviluppo locale

```bash
# 1. Scarica il binario PocketBase
./scripts/setup.sh

# 2. Installa le dipendenze frontend
cd frontend && npm install && cd ..
```

## Sviluppo locale

Avvia due processi in parallelo:

```bash
# Terminale 1 — backend PocketBase
./pocketbase serve

# Terminale 2 — frontend con hot reload
cd frontend && npm run dev
```

Apri http://localhost:5173. Il dev server fa proxy delle richieste `/api` e `/_` verso PocketBase (porta 8090).

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
docker compose up -d
```

- Dati persistenti in `./pb_data/` (bind mount automatico)
- Per aggiornare: `docker compose up -d --build`
- Per i log: `docker compose logs -f kura`

## Primo avvio: crea l'admin e l'utente

Dopo il primo `docker compose up -d`, esegui lo script di setup:

```bash
./scripts/seed_users.sh
```

Lo script chiede interattivamente email e password per l'account admin (superuser PocketBase) e per il tuo utente personale, poi li crea automaticamente. Va eseguito una sola volta su un'istanza fresh.

Variabili d'ambiente opzionali:

| Variabile         | Default                  | Descrizione                              |
|-------------------|--------------------------|------------------------------------------|
| `ALLOW_REGISTRATION` | `true` | Imposta a `false` per disabilitare la registrazione di nuovi utenti. Controlla sia l'UI che l'API di PocketBase. Richiede `docker compose build` dopo il cambio. |
| `PB_URL`          | `http://localhost:8090`  | URL di PocketBase (es. host remoto)      |
| `PB_TIMEOUT`      | `60`                     | Secondi di attesa per l'health check     |
| `COMPOSE_SERVICE` | `kura`                   | Nome del service in `docker-compose.yml` |

Al termine accedi all'app su **http://localhost:8090**.

## Backup

Tutti i dati si trovano nella cartella `pb_data/`. Backup manuale:

```bash
cp -r pb_data/ backup/pb_data_$(date +%Y%m%d_%H%M%S)/
```

## Sicurezza

Kura contiene dati sanitari sensibili. **Non esporre mai l'app su internet senza HTTPS.** Opzioni consigliate:

- Reverse proxy con TLS (Caddy, Nginx + Let's Encrypt)
- VPN privata per accesso personale (Tailscale, WireGuard)
