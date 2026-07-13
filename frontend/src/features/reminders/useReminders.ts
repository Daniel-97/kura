import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { Reminder } from '@/lib/types'

export function useReminders(recordId: string) {
  return useQuery({
    queryKey: ['reminders', recordId],
    queryFn: () =>
      pb.collection('reminders').getList<Reminder>(1, 50, {
        filter: pb.filter('record = {:recordId}', { recordId }),
        sort: 'fire_at',
      }),
    enabled: pb.authStore.isValid && !!recordId,
  })
}

export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      pb.collection('reminders').create<Reminder>(data),
    onSuccess: (reminder) => {
      qc.invalidateQueries({ queryKey: ['reminders', reminder.record] })
    },
  })
}

export function useDeleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; recordId: string }) =>
      pb.collection('reminders').delete(id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reminders', variables.recordId] })
    },
  })
}
