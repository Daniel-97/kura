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

export function useCreateMeasurement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Measurement, 'id' | 'created' | 'updated'>) =>
      pb.collection('measurements').create<Measurement>(data),
    onSuccess: (created) =>
      qc.invalidateQueries({ queryKey: ['measurements', created.type] }),
  })
}
