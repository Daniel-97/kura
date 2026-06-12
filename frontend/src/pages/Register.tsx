import { useState, useEffect } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useRegister } from '@/hooks/useRegister'

const ALLOW_REGISTRATION = import.meta.env.VITE_ALLOW_REGISTRATION === 'true'

export default function Register() {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const { register } = useRegister()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!ALLOW_REGISTRATION) {
      toast.error(t('register.disabled'))
    }
  }, [t])

  if (isAuthenticated) return <Navigate to="/" replace />
  if (!ALLOW_REGISTRATION) return <Navigate to="/login" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      toast.error(t('register.passwordMismatch'))
      return
    }
    setPending(true)
    try {
      await register(email, password, passwordConfirm)
    } catch {
      toast.error(t('common.error'))
      setPending(false)
      return
    }
    try {
      await login(email, password)
      toast.success(t('register.success'))
      navigate('/')
    } catch {
      toast.success(t('register.successLoginManually'))
      navigate('/login')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('register.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t('register.passwordConfirm')}</Label>
              <Input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                placeholder={t('register.passwordConfirmPlaceholder')}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t('common.loading') : t('register.submit')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('register.haveAccount')}{' '}
              <Link
                to="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('register.loginLink')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
