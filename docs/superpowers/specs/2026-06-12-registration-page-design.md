# Registration Page — Design Spec

**Date:** 2026-06-12  
**Status:** Approved

## Context

Kura è una app per la gestione di referti sanitari personali, self-hosted con PocketBase + React. La registrazione è attualmente disabilitata via migrazione (`2_disable_registration.js`): solo l'admin può creare utenti. L'obiettivo è aggiungere una pagina di registrazione controllata da una variabile d'ambiente, così che il proprietario dell'istanza possa aprire temporaneamente la registrazione (es. durante il setup iniziale della famiglia) e poi richiuderla.

## Requirements

- Pagina `/registrazione` con form email + password + conferma password
- Variabile d'ambiente `ALLOW_REGISTRATION` (default `false`) controlla tutto il sistema:
  - Quando `false`: rotta frontend redirige a `/login` con toast "Registrazione non disponibile"; PocketBase blocca la creazione via API (`createRule = null`)
  - Quando `true`: form visibile e funzionale; PocketBase accetta la creazione (`createRule = ""`)
- Link "Non hai un account? Registrati" sulla pagina di login, visibile solo se `ALLOW_REGISTRATION=true`
- Registrazione completamente aperta (nessun invito, nessuna approvazione admin)
- Auto-login dopo registrazione riuscita, redirect a `/` (Timeline)
- Supporto i18n completo (italiano + inglese)

## Architecture

### Environment Variable Propagation

L'utente imposta **una sola variabile** nel file `.env`:

```
ALLOW_REGISTRATION=true
```

Il `docker-compose.yml` la propaga a entrambi i layer:

```yaml
build:
  args:
    VITE_ALLOW_REGISTRATION: ${ALLOW_REGISTRATION:-false}
environment:
  ALLOW_REGISTRATION: ${ALLOW_REGISTRATION:-false}
```

- **Backend (runtime)**: `ALLOW_REGISTRATION` letto dall'hook PocketBase
- **Frontend (build-time)**: `VITE_ALLOW_REGISTRATION` baked nel bundle Vite

Cambiare la configurazione in produzione richiede rebuild: `docker compose build && docker compose up -d`.

### Backend — PocketBase Hook

Nuovo file: `pb_hooks/registration.js`

```javascript
onBootstrap((e) => {
    e.next();
    const allow = $os.getEnv("ALLOW_REGISTRATION") === "true";
    const col = $app.findCollectionByNameOrId("users");
    col.createRule = allow ? "" : null;
    $app.save(col);
});
```

Si esegue ad ogni avvio, dopo le migrazioni. Sovrascrive il `createRule = null` della migrazione `2_disable_registration.js` quando abilitato.

### Frontend — Nuovi file

**`frontend/src/pages/Register.tsx`**
- Form con campi: email, password, passwordConfirm
- Struttura identica a `Login.tsx` (shadcn/ui Card + Input + Button)
- Se `VITE_ALLOW_REGISTRATION !== 'true'`: redirect a `/login` + toast "Registrazione non disponibile"
- On submit: chiama `useRegister`, poi auto-login, poi redirect a `/`
- On error: toast con messaggio d'errore da PocketBase

**`frontend/src/hooks/useRegister.ts`**
- `register(email, password, passwordConfirm)` → `pb.collection('users').create({...})`
- On success: chiama `login(email, password)` dall'hook `useAuth` esistente

### Frontend — File modificati

**`frontend/src/App.tsx`**
- Aggiunge rotta pubblica `/#/registrazione` → `<Register />`
- La protezione dalla disabilitazione è interna al componente Register

**`frontend/src/pages/Login.tsx`**
- Aggiunge sotto il form: link `<Link to="/registrazione">Registrati</Link>` con testo localizzato
- Condizionale: `import.meta.env.VITE_ALLOW_REGISTRATION === 'true'`

**`frontend/src/i18n/locales/en.json` e `it.json`**
- Nuove chiavi sotto namespace `register`:
  - `register.title`, `register.email`, `register.password`, `register.passwordConfirm`, `register.submit`, `register.success`, `register.disabled`, `register.haveAccount`, `register.loginLink`
- Nuove chiavi in `login`:
  - `login.noAccount`, `login.registerLink`

**`docker-compose.yml`**
- Aggiunge `build.args.VITE_ALLOW_REGISTRATION` e `environment.ALLOW_REGISTRATION`

**`Dockerfile`**
- Stage Node builder: aggiunge `ARG VITE_ALLOW_REGISTRATION=false` prima di `npm run build`

## Data Flow — Registration

```
User fills form (Register.tsx)
    ↓
useRegister.register(email, password, passwordConfirm)
    ↓
pb.collection('users').create({ email, password, passwordConfirm })
    ↓ (se ALLOW_REGISTRATION=true → createRule="" → OK)
PocketBase creates user record
    ↓
useAuth.login(email, password)
    ↓
pb.collection('users').authWithPassword(email, password)
    ↓
pb.authStore updated → redirect to /
```

## Verification

1. **Dev con registrazione abilitata**:
   - Creare `frontend/.env.local`: `VITE_ALLOW_REGISTRATION=true`
   - Avviare PocketBase con `ALLOW_REGISTRATION=true ./pocketbase serve`
   - Aprire `http://localhost:5173` → Login deve mostrare link "Registrati"
   - Visitare `/#/registrazione` → form visibile
   - Registrarsi → redirect a Timeline

2. **Dev con registrazione disabilitata** (default):
   - Nessun `.env.local`, PocketBase senza env var
   - Visitare `/#/registrazione` → redirect a `/login` con toast

3. **Docker**:
   - `ALLOW_REGISTRATION=true docker compose build && docker compose up -d`
   - Verificare che login mostri link e che la registrazione funzioni

4. **Sicurezza backend**:
   - Con `ALLOW_REGISTRATION=false`, chiamata diretta `curl -X POST http://localhost:8090/api/collections/users/records` deve restituire `403`
