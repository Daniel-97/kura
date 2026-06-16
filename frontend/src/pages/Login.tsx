import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      toast.error(t('auth.loginError'))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="page-shell-centered">
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="auth-title">Kura</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-field">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="btn-block" disabled={pending}>
              {pending ? t('common.loading') : t('auth.login')}
            </Button>
            {import.meta.env.VITE_ALLOW_REGISTRATION === 'true' && (
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link
                  to="/register"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  {t('auth.registerLink')}
                </Link>
              </p>
            )}
            <div className="pt-2 text-center">
              <a
                href="/_/"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                {t('auth.adminLink')}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
