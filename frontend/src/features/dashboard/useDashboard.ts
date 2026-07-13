import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { HealthRecord, Reminder } from '@/lib/types'

export interface PendingReminder extends Reminder {
  expand?: { record?: HealthRecord }
}

/** The next 3 scheduled visits, soonest first. */
export function useUpcomingRecords() {
  return useQuery({
    queryKey: ['records', 'upcoming'] as const,
    queryFn: () =>
      pb.collection('records').getList<HealthRecord>(1, 3, {
        sort: 'date',
        filter: pb.filter('date >= {:now}', { now: new Date() }),
      }),
    enabled: pb.authStore.isValid,
  })
}

/** Reminders not sent yet, soonest first, with the linked record resolved. */
export function usePendingReminders() {
  return useQuery({
    queryKey: ['reminders', 'pending'] as const,
    queryFn: () =>
      pb.collection('reminders').getList<PendingReminder>(1, 5, {
        sort: 'fire_at',
        filter: "sent_at = ''",
        expand: 'record',
      }),
    enabled: pb.authStore.isValid,
  })
}
