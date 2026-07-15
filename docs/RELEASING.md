# Guida al rilascio

Come si sviluppa, si taggano le versioni e si pubblica una nuova release di
Kura su ghcr.io. Il workflow CI/CD è in
[`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml).

## 1. Branch

- `main` è l'unico branch stabile a lungo termine — deve restare sempre
  deployabile.
- Il lavoro si fa su branch a vita breve, mergiati su `main` via PR e poi
  cancellati:
  - `feature/nome-cosa` — nuove funzionalità
  - `fix/nome-bug` — bugfix
- Ogni push su `main` pubblica automaticamente l'immagine `edge` (vedi
  sezione 3) — è la build "più recente possibile", non testata, utile per
  provare una fix prima che diventi una release.

## 2. Versionamento

Semantic Versioning (`vMAJOR.MINOR.PATCH`, es. `v1.4.2`):

| Bump  | Quando |
|-------|--------|
| MAJOR | Breaking change — serve un intervento manuale per aggiornare (es. migrazione/wipe dati, env var rinominata) |
| MINOR | Nuove funzionalità retrocompatibili |
| PATCH | Bugfix, patch di sicurezza |

Ogni release nasce da un **tag Git `vX.Y.Z` su un commit di `main`** (mai su
un branch di lavoro).

## 3. Cosa pubblica la CI

| Trigger | Tag immagine pubblicati |
|---|---|
| Push su `main` | `ghcr.io/daniel-97/kura:edge` |
| Push tag `vX.Y.Z` | `:X.Y.Z`, `:X.Y`, `:X`, `:latest` |

`latest` segue sempre l'ultima release taggata, mai le build `edge`.

## 4. Procedura per rilasciare una nuova versione

1. Assicurati che `main` sia verde (CI passata, `make check` pulito) e che
   contenga tutto quello che vuoi rilasciare.
2. Aggiorna [`CHANGELOG.md`](../CHANGELOG.md): sposta le voci da
   `[Unreleased]` a una nuova sezione `## [X.Y.Z] - YYYY-MM-DD`. Se la
   versione è MAJOR o comunque richiede un passaggio manuale
   all'aggiornamento (es. wipe di `pb_data/`, nuova env var obbligatoria),
   descrivilo esplicitamente nella voce — è la prima cosa che chi fa
   self-hosting legge prima di aggiornare.
3. Committa il CHANGELOG su `main`:
   ```bash
   git add CHANGELOG.md
   git commit -m "chore(release): v1.4.2"
   git push origin main
   ```
4. Crea e pusha il tag **sull'ultimo commit di `main`**:
   ```bash
   git tag v1.4.2
   git push origin v1.4.2
   ```
5. Il push del tag scatena il workflow: build multi-arch (amd64/arm64) e
   push su ghcr.io dei quattro tag della tabella sopra. Segui il progresso
   in Actions sul repo GitHub.
6. Verifica che l'immagine sia stata pubblicata e sia **pubblica** (package
   Settings su GitHub → Change visibility; va fatto solo la prima volta che
   il package viene creato, resta pubblico per le release successive):
   ```bash
   docker pull ghcr.io/daniel-97/kura:1.4.2
   ```
7. Aggiorna il tag pinnato in
   [`docker-compose.prod.yml`](../docker-compose.prod.yml) alla nuova
   versione (è l'esempio che gli utenti finali copiano) e, se vuoi, apri una
   GitHub Release dal tag con le note prese dal CHANGELOG.

## 5. Aggiornare un'istanza self-hosted esistente

Per chi gestisce un'istanza Kura (te compreso):

1. Leggi la voce del CHANGELOG della versione target — se richiede un
   passaggio manuale, fallo **prima** di aggiornare l'immagine.
2. Aggiorna il tag in `docker-compose.prod.yml` (o nel proprio compose file)
   alla nuova versione.
3. ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```
4. Le migrazioni di schema in `pb_migrations/` vengono applicate
   automaticamente da PocketBase all'avvio del container — non serve alcuno
   step manuale per quelle in sé, solo per gli eventuali passaggi descritti
   nel CHANGELOG (wipe, toggle dal dashboard admin, ecc. — è già capitato
   per i campi `protected`/`thumbs`/`language`, vedi `docs/TODO.md`).
