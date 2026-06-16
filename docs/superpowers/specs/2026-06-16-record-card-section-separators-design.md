# RecordCard Section Separators — Design Spec

**Date:** 2026-06-16
**Status:** Approved

## Context

`frontend/src/components/RecordCard.tsx` rende tre sezioni distinte: **main** (titolo, badge, data, descrizione, tag), **reminders** (`<ReminderList>`), e **files** (griglia allegati). Oggi l'unica separazione è un `mt-3` sul file block — nessuna linea visiva. Le tre sezioni visivamente "si fondono" e la card è più difficile da scansionare. Obiettivo: introdurre separatori orizzontali sottili tra le sezioni, mantenendo l'estetica minimal esistente e il supporto light/dark via variabili shadcn.

## Requirements

- Separatore orizzontale a linea sottile (1px, `border-border`) tra **main** e **reminders**
- Separatore orizzontale a linea sottile tra **reminders** e **files**, **solo se** la sezione files è presente (`record.file && record.file.length > 0`)
- Nessuna label di sezione, nessun colore hardcoded, nessuna animazione
- Funzionante in light e dark mode tramite le variabili CSS shadcn esistenti
- Nessuna nuova dipendenza npm, nessuna modifica a `index.css`, `tailwind.config.ts`, o traduzioni i18n
- Nessuna regressione sul comportamento esistente: click sulla card, ripple effect, dropdown menu, navigazione, file preview, reminders add/delete

## Architecture

### File modificato (unico)

`frontend/src/components/RecordCard.tsx`

### Decisione: nessun componente `Separator` shadcn

Il progetto non ha `frontend/src/components/ui/separator.tsx`. Aggiungerlo via `npx shadcn@latest add separator` introdurrebbe un file generato e una dipendenza per un singolo `<div className="border-t" />`. AGENTS.md recita "Minimize npm dependencies; document reasoning for any new addition". Il border usa già la variabile CSS `--border` (applicata globalmente da `* { @apply border-border }` in `index.css:52`), identica a quella che shadcn userebbe. **YAGNI**: niente nuovo componente, un div con due classi Tailwind.

### Modifiche

**1. Separatore main ↔ reminders (sempre presente)**

Inserire un `<div className="my-3 border-t" />` tra la chiusura del main content block (sotto il tag `</div>` di chiusura di `<div className="min-w-0 flex-1 space-y-1">` a linea 104) e `<ReminderList ... />` a linea 103. Poiché la `ReminderList` rende sempre (anche nello stato vuoto con il bottone "Add"), questo separatore è incondizionato.

Posizionamento: subito prima di `<ReminderList recordId={record.id} recordDate={record.date} />`.

**2. Separatore reminders ↔ files (condizionale)**

Sostituire l'attuale wrapper del file block:

```tsx
{record.file && record.file.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-2">
```

con:

```tsx
{record.file && record.file.length > 0 && (
  <>
    <div className="my-3 border-t" />
    <div className="flex flex-wrap gap-2">
```

e chiudere il fragment `</>` dopo l'attuale `</div>` di chiusura del file block. Il `mt-3` viene rimosso perché sostituito dal `my-3` del separatore.

**3. Nessuna modifica al markup esistente all'interno di ciascuna sezione**

Le tre sezioni mantengono la loro struttura interna identica. Si aggiungono solo divisori *tra* di esse.

### Markup risultante (sintetico)

```tsx
<Card ...>
  <CardContent className="py-4">
    <div className="flex items-start justify-between gap-3">
      {/* ... main: title, badge, date, description, tags ... */}
      <ReminderList ... />
      {/* ... dropdown menu ... */}
    </div>

    {record.file && record.file.length > 0 && (
      <>
        <div className="my-3 border-t" />
        <div className="flex flex-wrap gap-2">
          {/* ... file thumbnails ... */}
        </div>
      </>
    )}
  </CardContent>
</Card>
```

## Testing

Nessun test automatico (il progetto non ne ha — verificato che `package.json` non ha script `test`). Verifica manuale con il checklist di AGENTS.md root, voce "Manual feature checklist":

1. Aprire la Timeline (`http://localhost:5173/`)
2. **Card senza reminders e senza files**: la card mostra solo la sezione main, nessun separatore (perché reminders rende sempre). Confermato: la sezione reminders c'è sempre per design (anche con "no reminders" + bottone Add).
3. **Card con reminders ma senza files**: separatore visibile tra main e reminders; nessun secondo separatore (files assenti).
4. **Card con reminders e con files**: due separatori visibili, layout pulito e scannable.
5. **Click sulla card**: ripple effect ancora funzionante (verifica che il separatore non intercetti click).
6. **Dropdown menu "⋮"**: apertura, Edit, Delete, dialog di conferma ancora funzionanti.
7. **Aggiunta di un reminder**: bottone "Add" in `ReminderList` ancora funzionante, il separatore non ne impedisce il click.
8. **Click su una thumbnail file**: apre l'immagine/PDF in nuova tab, separatore non intercetta.
9. **Switch lingua IT ↔ EN**: nessuna stringa nuova, niente da tradurre.
10. **Switch light ↔ dark mode**: il `border-t` usa `--border` (variabile shadcn), si adatta automaticamente.

## Edge cases

- **Card con descrizione vuota e senza tag**: il main è più corto, ma il separatore resta nello stesso punto (sempre dopo i tag, prima dei reminders). Comportamento voluto.
- **Card con titolo lunghissimo che va a capo**: il separatore è a livello del `CardContent`, non del flex interno, quindi si estende a tutta la larghezza della card anche con contenuto alto. Corretto.
- **Card con molti file (es. 10 thumbnail)**: il separatore precede il grid, comportamento identico a quello attuale con `mt-3` ma con linea visiva.
