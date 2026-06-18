import { useEffect } from 'react'
import SidebarContent from './SidebarContent'

interface AppDrawerProps {
  open: boolean
  onClose: () => void
}

export default function AppDrawer({ open, onClose }: AppDrawerProps) {
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open)
    return () => { document.body.classList.remove('overflow-hidden') }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        id="app-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background border-r transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onNavigate={onClose} />
      </div>
    </>
  )
}
