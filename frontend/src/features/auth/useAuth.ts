import { useState, useEffect, useCallback } from 'react'
import { pb } from '@/lib/pb'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string
  verified: boolean
  created: string
  updated: string
}

function readUser(): AuthUser | null {
  const record = pb.authStore.model
  if (!record) return null
  // PocketBase SDK types authStore.model as {[key: string]: any} | null; the users collection populates every AuthUser field.
  return record as unknown as AuthUser
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [userId, setUserId] = useState<string | null>(
    pb.authStore.isValid ? (pb.authStore.model?.id ?? null) : null
  )
  const [user, setUser] = useState<AuthUser | null>(readUser())

  useEffect(() => {
    const unsub = pb.authStore.onChange((_token, model) => {
      setIsAuthenticated(pb.authStore.isValid)
      setUserId(model?.id ?? null)
      // PocketBase SDK types authStore.model as {[key: string]: any} | null; the users collection populates every AuthUser field.
      setUser(model ? (model as unknown as AuthUser) : null)
    })
    return unsub
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    return pb.collection('users').authWithPassword(email, password)
  }, [])

  const logout = useCallback(() => {
    pb.authStore.clear()
  }, [])

  return { isAuthenticated, userId, user, login, logout }
}
