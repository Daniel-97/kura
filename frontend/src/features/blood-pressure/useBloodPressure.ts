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

export function useCreateBloodPressure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<BloodPressureRecord, 'id' | 'created' | 'updated'>) =>
      pb.collection('blood_pressure').create<BloodPressureRecord>(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bloodPressure'] }),
  })
}
