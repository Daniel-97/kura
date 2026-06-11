# Drawer di navigazione — Design Spec

**Data:** 2026-06-11  
**Scope:** Sostituire i link di navigazione nell'header con un drawer overlay laterale

---

## Contesto

L'header attuale contiene Timeline, Pressione, LanguageSwitcher e logout tutti inline nella barra superiore. L'obiettivo è spostare la navigazione in un menu laterale a comparsa (drawer) per un layout più pulito e scalabile.

---

## Decisioni di design

| Aspetto | Scelta |
|---|---|
| Stile drawer | Overlay — si apre sopra i contenuti con backdrop semitrasparente |
| Trigger | Pulsante ☰ (hamburger) in alto a sinistra nell'header |
| Header (chiuso) | ☰ + "Kura" (testo) + LanguageSwitcher a destra |
| Interno drawer | Logo K colorato + titolo, sezione "SEZIONI" con voci nav, logout in fondo |
| Tema | Variabili CSS shadcn/ui — si adegua a light e dark mode automaticamente |

---

## Layout

### Header (drawer chiuso)

```
┌─────────────────────────────────┐
│ ☰  Kura                    [IT] │  h-14, sticky top-0, border-b
└─────────────────────────────────┘
```

- `☰` apre il drawer
- `"Kura"` è testo statico, non link
- `LanguageSwitcher` resta a destra, invariato
- I link Timeline e Pressione spariscono dall'header

### Drawer (aperto)

```
┌────────────────┬──────────────────────────┐
│ [K]  Kura      │░░░░░░░░░░░░░░░░░░░░░░░░░│
│────────────────│░░░ backdrop bg-black/50 ░│
│  SEZIONI       │░░░ (click chiude) ░░░░░░░│
│                │░░░░░░░░░░░░░░░░░░░░░░░░░│
│  📋 Timeline   │░░░░░░░░░░░░░░░░░░░░░░░░░│
│  ❤️  Pressione  │░░░░░░░░░░░░░░░░░░░░░░░░░│
│                │░░░░░░░░░░░░░░░░░░░░░░░░░│
│────────────────│                          │
│  ↩ Esci        │                          │
└────────────────┴──────────────────────────┘
```

- Larghezza: `w-64` (256px)
- Voce attiva: `bg-accent text-accent-foreground` con `rounded-md`
- Voce inattiva: `text-muted-foreground hover:bg-accent hover:text-accent-foreground`
- Animazione: `translate-x-0 / -translate-x-full` + `transition-transform duration-200`
- Il backdrop ha `z-40`, il drawer ha `z-50`

---

## Architettura componenti

### Nuovo componente: `AppDrawer.tsx`

Responsabilità singola: renderizza il drawer e il backdrop.

**Props:**
```ts
interface AppDrawerProps {
  open: boolean
  onClose: () => void
}
```

**Struttura interna:**
- Backdrop: `div fixed inset-0 bg-black/50 z-40` — visibile solo se `open`
- Drawer: `div fixed inset-y-0 left-0 w-64 bg-background border-r z-50` con `translate-x`
- Header drawer: logo K (`bg-primary text-primary-foreground`, quadrato `rounded-md`) + "Kura"
- Label sezione: `text-xs font-semibold uppercase tracking-widest text-muted-foreground`
- Voci nav: `NavLink` di react-router-dom con `className` che applica `bg-accent` se attivo
- Separatore: `border-t` prima del logout
- Logout: `button` che chiama `logout()` e chiude il drawer

### Modifiche a `App.tsx`

- Aggiungere stato `const [drawerOpen, setDrawerOpen] = useState(false)`
- Rimuovere `<Link to="/">` e `<Link to="/pressione">` dall'header
- Aggiungere pulsante `☰` che chiama `setDrawerOpen(true)`
- Renderizzare `<AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />` dentro il blocco `{isAuthenticated && ...}`

---

## Comportamento

- Click backdrop → chiude drawer
- Click su voce nav → naviga + chiude drawer
- Click logout → chiama `logout()` + chiude drawer
- Pressione `Escape` → chiude drawer
- Scroll del body bloccato mentre il drawer è aperto (`overflow-hidden` su `body`)

---

## File coinvolti

| File | Modifica |
|---|---|
| `src/components/AppDrawer.tsx` | **Nuovo** — componente drawer |
| `src/App.tsx` | Rimuovere link nav dall'header, aggiungere ☰ e `<AppDrawer>` |

Nessuna nuova dipendenza richiesta.
