import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pb'

interface EmailStatus {
  emailEnabled: boolean
}

/**
 * Whether the server can actually deliver emails (custom hook route,
 * boolean only). Used to warn next to email toggles when SMTP is not
 * configured. Instance-level and immutable at runtime: cache for the
 * whole session.
 */
export function useEmailStatus() {
  return useQuery({
    queryKey: ['emailStatus'] as const,
    queryFn: () => pb.send<EmailStatus>('/api/kura/email-status', {}),
    enabled: pb.authStore.isValid,
    staleTime: Infinity,
  })
}
