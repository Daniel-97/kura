import { useState, useEffect, useCallback } from 'react'
import { pb } from '@/lib/pb'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [userId, setUserId] = useState<string | null>(
    pb.authStore.isValid ? (pb.authStore.model?.id ?? null) : null
  )

  useEffect(() => {
    const unsub = pb.authStore.onChange((_token, model) => {
      setIsAuthenticated(pb.authStore.isValid)
      setUserId(model?.id ?? null)
    })
    return unsub
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    return pb.collection('users').authWithPassword(email, password)
  }, [])

  const logout = useCallback(() => {
    pb.authStore.clear()
  }, [])

  return { isAuthenticated, userId, login, logout }
}
