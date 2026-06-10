import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { HealthRecord } from '@/lib/types'

interface RecordFilters {
  category?: string
  tag?: string
}

function buildFilter(filters: RecordFilters): string {
  const parts: string[] = []
  if (filters.category) parts.push(`category = "${filters.category}"`)
  if (filters.tag)      parts.push(`tags ~ "${filters.tag}"`)
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
