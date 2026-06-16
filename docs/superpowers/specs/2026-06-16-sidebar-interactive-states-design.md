# Sidebar Interactive States — Design Spec

**Date:** 2026-06-16
**Status:** Approved

## Context

La sidebar di Kura (`frontend/src/components/SidebarContent.tsx`) ha già classi per active/hover sugli elementi nav (`bg-accent` e `hover:bg-accent`), ma il colore `accent` shadcn (`hsl(210 40% 96.1%)`) è grigio chiarissimo, quindi gli stati sono quasi invisibili. Il bottone logout cambia solo `text-muted-foreground → text-foreground`, niente background. Obiettivo: rendere gli stati active/hover visibili e piacevoli, in stile **sottile, sfumato, monocromatico**, senza animazioni sulle icone.

## Requirements

- Stato **active** (voce selezionata): background con gradient orizzontale monocromatico, testo in `accent-foreground`, font medium
- Stato **hover** (voce non selezionata): background accent a opacity ridotta, testo che passa a `foreground`
- Bottone **logout**: stesso trattamento hover degli altri nav items
- Transizioni colore smooth (`transition-colors duration-200`)
- Nessuna animazione su icone, testo, o altri elementi
- Funzionante in light e dark mode (solo variabili CSS shadcn)
- Nessuna nuova dipendenza, nessuna modifica a `index.css` o `tailwind.config.ts`

## Architecture

### File modificato (unico)

`frontend/src/components/SidebarContent.tsx`

### Modifiche

**1. Aggiornamento di `navClass` (riga 13-18)**

Classi base (sempre presenti):
```
flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200
```

Stato attivo:
```
bg-primary text-primary-foreground font-medium
```

> Stesso trattamento del bottone "Aggiungi record" (variant default shadcn: `bg-primary text-primary-foreground`). In light mode: blocco scuro + testo chiaro, molto risaltato. In dark mode: blocco chiaro + testo scuro.

Stato hover (inattivo):
```
text-muted-foreground hover:bg-accent/50 hover:text-foreground
```

**2. Bottone logout (riga 44-50)**

Aggiunte classi per allinearlo agli altri nav items:
- `rounded-md px-3 py-2 w-full transition-colors duration-200`
- `hover:bg-accent/50 hover:text-foreground`

## Verification

1. `cd frontend && npm run lint` → type check passa
2. Avviare dev server (`./pocketbase serve` + `npm run dev`)
3. Login → verificare Timeline visualizzata con sfondo gradient sulla voce "Timeline"
4. Hover su "Pressione" → verificare background `accent/50` visibile
5. Click su "Pressione" → verificare che il gradient si sposti sulla voce cliccata e Timeline torni allo stato hover
6. Hover su "Esci" → verificare background `accent/50` + cambio colore testo
7. Ripetere 3-6 in dark mode
