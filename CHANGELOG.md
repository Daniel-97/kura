# Changelog

Tutte le modifiche rilevanti di Kura sono documentate qui.
Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/),
versionamento secondo [Semantic Versioning](https://semver.org/lang/it/).

Ogni release è taggata su Git come `vX.Y.Z` e pubblica un'immagine su
`ghcr.io/daniel-97/kura` (vedi [.github/workflows/docker-publish.yml](.github/workflows/docker-publish.yml)).

## [Unreleased]

## Convenzioni

- **MAJOR**: breaking change — richiede un intervento manuale prima o dopo
  l'aggiornamento (es. migrazione/wipe di `pb_data/`, variabile d'ambiente
  rinominata). Va sempre descritto un "Come aggiornare" nella voce.
- **MINOR**: nuove funzionalità retrocompatibili.
- **PATCH**: bugfix e patch di sicurezza, nessuna azione richiesta.
- Le migrazioni di schema in `pb_migrations/` vengono applicate
  automaticamente da PocketBase all'avvio del container — non serve uno step
  manuale per quelle. Un MAJOR bump segnala i casi (finora tutti) in cui lo
  schema aggiunge un campo/collezione che PocketBase non retro-applica da solo
  alle istanze già in vita (es. campo nuovo su una collezione esistente),
  finora risolti con wipe di `pb_data/` in sviluppo o toggle manuale dal
  dashboard admin in produzione — vedi lo storico in `docs/TODO.md`.
