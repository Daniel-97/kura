import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { Therapy } from '@/lib/types'

export function useTherapies() {
  return useQuery({
    queryKey: ['therapies'] as const,
    queryFn: () =>
      pb.collection('therapies').getFullList<Therapy>({ sort: 'name' }),
    enabled: pb.authStore.isValid,
  })
}

type TherapyData = Partial<Omit<Therapy, 'id' | 'created' | 'updated'>>

export function useCreateTherapy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TherapyData) => pb.collection('therapies').create<Therapy>(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['therapies'] }),
  })
}

export function useUpdateTherapy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TherapyData }) =>
      pb.collection('therapies').update<Therapy>(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['therapies'] }),
  })
}

export function useDeleteTherapy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pb.collection('therapies').delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['therapies'] }),
  })
}
