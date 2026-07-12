import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pb'

// Renew the token this long before its exp claim, so in-flight image
// requests never race the expiry.
const RENEW_MARGIN_MS = 30_000
const MIN_REFETCH_MS = 5_000

export function msUntilExpiry(token: string, now = Date.now()): number {
  try {
    const [, payload] = token.split('.')
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof decoded.exp !== 'number') return 0
    return Math.max(0, decoded.exp * 1000 - now)
  } catch {
    return 0
  }
}

/**
 * Short-lived PocketBase file token, required to download protected files.
 * Refetches automatically before the token expires.
 */
export function useFileToken() {
  return useQuery({
    queryKey: ['fileToken'],
    queryFn: () => pb.files.getToken(),
    enabled: pb.authStore.isValid,
    staleTime: 30_000,
    refetchInterval: (query) => {
      const token = query.state.data
      if (!token) return false
      return Math.max(msUntilExpiry(token) - RENEW_MARGIN_MS, MIN_REFETCH_MS)
    },
  })
}
