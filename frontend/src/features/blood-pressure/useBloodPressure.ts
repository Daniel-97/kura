import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { BloodPressureRecord } from '@/lib/types'

export function useBloodPressure() {
  return useQuery({
    queryKey: ['bloodPressure'] as const,
    queryFn: () =>
      pb.collection('blood_pressure').getList<BloodPressureRecord>(1, 100, {
        sort: '-measured_at',
      }),
    enabled: pb.authStore.isValid,
  })
}

/** All readings from the last `days` days, unbounded by record count (unlike
 *  useBloodPressure's 100-record page) — needed so summary stats over a 90-day
 *  window stay correct even for users who log more than 100 times in it. */
export function useRecentBloodPressure(days = 90) {
  return useQuery({
    queryKey: ['bloodPressure', 'recent', days] as const,
    queryFn: () => {
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString()
      return pb.collection('blood_pressure').getFullList<BloodPressureRecord>({
        filter: pb.filter('measured_at >= {:cutoff}', { cutoff }),
        sort: '-measured_at',
      })
    },
    enabled: pb.authStore.isValid,
  })
}

export function useCreateBloodPressure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<BloodPressureRecord, 'id' | 'created' | 'updated'>) =>
      pb.collection('blood_pressure').create<BloodPressureRecord>(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bloodPressure'] }),
  })
}
