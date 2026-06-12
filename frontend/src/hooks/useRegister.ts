import { useCallback } from 'react'
import { pb } from '@/lib/pb'

export function useRegister() {
  const register = useCallback(async (
    email: string,
    password: string,
    passwordConfirm: string,
  ) => {
    return pb.collection('users').create({ email, password, passwordConfirm })
  }, [])

  return { register }
}
