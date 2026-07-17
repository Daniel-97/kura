import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { Measurement, MeasurementType } from '@/lib/types'

export function useMeasurements(type: MeasurementType) {
  return useQuery({
    queryKey: ['measurements', type] as const,
    queryFn: () =>
      pb.collection('measurements').getList<Measurement>(1, 100, {
        sort: '-measured_at',
        filter: pb.filter('type = {:type}', { type }),
      }),
    enabled: pb.authStore.isValid,
  })
}

/** All measurements of a type from the last `days` days, unbounded by record count
 *  (unlike useMeasurements' 100-record page) — needed so summary stats over a
 *  90-day window stay correct even for users who log more than 100 times in it. */
export function useRecentMeasurements(type: MeasurementType, days = 90) {
  return useQuery({
    queryKey: ['measurements', type, 'recent', days] as const,
    queryFn: () => {
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString()
      return pb.collection('measurements').getFullList<Measurement>({
        filter: pb.filter('type = {:type} && measured_at >= {:cutoff}', { type, cutoff }),
        sort: '-measured_at',
      })
    },
    enabled: pb.authStore.isValid,
  })
}

export function useCreateMeasurement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Measurement, 'id' | 'created' | 'updated'>) =>
      pb.collection('measurements').create<Measurement>(data),
    onSuccess: (created) =>
      qc.invalidateQueries({ queryKey: ['measurements', created.type] }),
  })
}
