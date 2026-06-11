# Drawer di navigazione — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire i link di navigazione nell'header con un drawer overlay laterale che scorre da sinistra.

**Architecture:** Un nuovo componente `AppDrawer` gestisce interamente drawer e backdrop. `App.tsx` mantiene lo stato `drawerOpen` e passa `open/onClose` al componente. L'header perde i link di navigazione e guadagna un pulsante hamburger.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, react-router-dom v6 (`NavLink`), lucide-react (`Menu`), react-i18next

---

### Task 1: Aggiungere la chiave i18n `nav.sections`

**Files:**
- Modify: `frontend/src/i18n/locales/it.json`
- Modify: `frontend/src/i18n/locales/en.json`

- [ ] **Step 1: Aggiungere le chiavi in italiano**

Aprire `frontend/src/i18n/locales/it.json` e aggiungere `"sections"` e `"openMenu"` dentro `"nav"`:

```json
"nav": {
  "timeline": "Diario",
  "newRecord": "Nuovo referto",
  "pressure": "Pressione",
  "sections": "Sezioni",
  "openMenu": "Apri menu"
},
```

- [ ] **Step 2: Aggiungere le chiavi in inglese**

Aprire `frontend/src/i18n/locales/en.json` e aggiungere `"sections"` e `"openMenu"` dentro `"nav"`:

```json
"nav": {
  "timeline": "Timeline",
  "newRecord": "New record",
  "pressure": "Blood pressure",
  "sections": "Sections",
  "openMenu": "Open menu"
},
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/i18n/locales/it.json frontend/src/i18n/locales/en.json
git commit -m "feat: add nav.sections and nav.openMenu i18n keys"
```

---

### Task 2: Creare il componente `AppDrawer`

**Files:**
- Create: `frontend/src/components/AppDrawer.tsx`

- [ ] **Step 1: Creare il file**

Creare `frontend/src/components/AppDrawer.tsx` con il seguente contenuto:

```tsx
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

interface AppDrawerProps {
  open: boolean
  onClose: () => void
}

export default function AppDrawer({ open, onClose }: AppDrawerProps) {
  const { t } = useTranslation()
  const { logout } = useAuth()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive
        ? 'bg-accent text-accent-foreground font-medium'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background border-r transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold select-none">
            K
          </div>
          <span className="font-semibold text-sm">Kura</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('nav.sections')}
          </p>
          <NavLink to="/" end className={navClass} onClick={onClose}>
            <span>📋</span>
            {t('nav.timeline')}
          </NavLink>
          <NavLink to="/pressione" className={navClass} onClick={onClose}>
            <span>❤️</span>
            {t('nav.pressure')}
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <button
            onClick={() => { logout(); onClose() }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>↩</span>
            {t('common.logout')}
          </button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verificare che TypeScript non abbia errori**

```bash
cd frontend && npx tsc --noEmit
```

Atteso: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/AppDrawer.tsx
git commit -m "feat: add AppDrawer overlay component"
```

---

### Task 3: Aggiornare `App.tsx`

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Aggiungere import e stato**

Sostituire il contenuto di `frontend/src/App.tsx` con:

```tsx
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AppDrawer from '@/components/AppDrawer'
import Login from '@/pages/Login'
import Timeline from '@/pages/Timeline'
import RecordForm from '@/pages/RecordForm'
import Pressione from '@/pages/Pressione'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {isAuthenticated && (
        <>
          <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded p-1.5 hover:bg-accent transition-colors"
                  aria-label={t('nav.openMenu')}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <span className="text-lg font-semibold">Kura</span>
              </div>
              <LanguageSwitcher />
            </div>
          </header>
          <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
      )}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AuthGuard><Timeline /></AuthGuard>} />
          <Route path="/nuovo" element={<AuthGuard><RecordForm /></AuthGuard>} />
          <Route path="/pressione" element={<AuthGuard><Pressione /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}
```

- [ ] **Step 2: Verificare TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Atteso: nessun errore.

- [ ] **Step 3: Verifica manuale nel browser**

Aprire http://localhost:5173 (il dev server Vite deve essere già in esecuzione).

Checklist:
- [ ] L'header mostra solo ☰ + "Kura" + selettore lingua
- [ ] Click su ☰ apre il drawer da sinistra con animazione
- [ ] Il drawer mostra logo K, sezione "SEZIONI", "Diario", "Pressione", "Esci" in fondo
- [ ] La voce attiva è evidenziata (sfondo accent)
- [ ] Click sul backdrop chiude il drawer
- [ ] Tasto Escape chiude il drawer
- [ ] Click su una voce naviga e chiude il drawer
- [ ] Click su "Esci" esegue il logout
- [ ] Lo scroll del body è bloccato mentre il drawer è aperto
- [ ] In tema light il drawer è bianco; in dark è scuro

- [ ] **Step 4: Commit finale**

```bash
git add frontend/src/App.tsx frontend/src/i18n/locales/it.json frontend/src/i18n/locales/en.json
git commit -m "feat: replace header nav with overlay drawer"
```
