import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { HealthRecord, Reminder, Measurement, MeasurementType } from '@/lib/types'

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

/** Most recent measurement of a given type (one row). */
export function useLatestMeasurement(type: MeasurementType) {
  return useQuery({
    queryKey: ['measurements', type, 'latest'] as const,
    queryFn: () =>
      pb.collection('measurements').getList<Measurement>(1, 1, {
        sort: '-measured_at',
        filter: pb.filter('type = {:type}', { type }),
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
