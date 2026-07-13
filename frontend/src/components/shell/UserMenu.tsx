import { useState } from 'react'
import { LogOut, Download, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { exportAllData } from '@/features/export/exportAll'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/useAuth'

function initialsOf(name: string, email: string): string {
  const source = name.trim() || email.trim()
  if (!source) return '?'
  const first = source[0]
  return first ? first.toUpperCase() : '?'
}

export default function UserMenu() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportAllData()
      toast.success(t('export.success'))
    } catch {
      toast.error(t('export.error'))
    } finally {
      setIsExporting(false)
    }
  }

  const displayName = user?.name?.trim() || user?.email || t('userMenu.fallbackName')
  const email = user?.email ?? ''
  const initials = initialsOf(user?.name ?? '', user?.email ?? '')
  const ariaLabel = `${t('userMenu.aria')} (${displayName})`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={ariaLabel}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold select-none transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
          <span className="text-sm font-medium leading-tight text-foreground">
            {displayName}
          </span>
          {email && email !== displayName && (
            <span className="text-xs font-normal text-muted-foreground leading-tight">
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isExporting}
          onSelect={(e) => {
            e.preventDefault() // keep the menu open so the spinner stays visible
            handleExport()
          }}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t('export.menuItem')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()}>
          <LogOut className="h-4 w-4" />
          {t('userMenu.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
