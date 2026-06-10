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

1. Apri http://localhost:8090/_/ (dashboard admin di PocketBase)
2. Crea il tuo account admin
3. Vai su **Collections → users** e aggiungi il tuo utente con email e password
4. Accedi all'app su http://localhost:5173 (dev) o http://localhost:8090 (produzione)

## Backup

Tutti i dati si trovano nella cartella `pb_data/`. Backup manuale:

```bash
cp -r pb_data/ backup/pb_data_$(date +%Y%m%d_%H%M%S)/
```

## Sicurezza

Kura contiene dati sanitari sensibili. **Non esporre mai l'app su internet senza HTTPS.** Opzioni consigliate:

- Reverse proxy con TLS (Caddy, Nginx + Let's Encrypt)
- VPN privata per accesso personale (Tailscale, WireGuard)
