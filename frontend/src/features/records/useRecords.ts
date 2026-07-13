import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { HealthRecord } from '@/lib/types'

interface RecordFilters {
  category?: string
  tag?: string
}

export function buildFilter(filters: RecordFilters): string {
  const parts: string[] = []
  if (filters.category) parts.push(pb.filter('category = {:category}', { category: filters.category }))
  if (filters.tag)      parts.push(pb.filter('tags ~ {:tag}', { tag: filters.tag }))
  return parts.join(' && ')
}

export function useRecords(filters: RecordFilters = {}) {
  return useQuery({
    queryKey: ['records', filters] as const,
    queryFn: () =>
      pb.collection('records').getList<HealthRecord>(1, 500, {
        sort: '-date',
        filter: buildFilter(filters),
      }),
    enabled: pb.authStore.isValid,
  })
}

export function useCreateRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FormData) =>
      pb.collection('records').create<HealthRecord>(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['records'] }),
  })
}

export function useDeleteRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pb.collection('records').delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['records'] }),
  })
}

export function useFetchRecord(id: string) {
  return useQuery({
    queryKey: ['records', id],
    queryFn: () => pb.collection('records').getOne<HealthRecord>(id),
    enabled: !!id && pb.authStore.isValid,
  })
}

export function useUpdateRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      pb.collection('records').update<HealthRecord>(id, data),
    onSuccess: (record) => {
      qc.invalidateQueries({ queryKey: ['records'] })
      qc.setQueryData(['records', record.id], record)
    },
  })
}
