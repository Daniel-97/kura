import { useQuery, useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import type { ListResult } from 'pocketbase'
import { pb } from '@/lib/pb'
import type { HealthRecord } from '@/lib/types'

const PER_PAGE = 100

interface RecordFilters {
  category?: string
  search?: string
}

export function buildFilter(filters: RecordFilters): string {
  const parts: string[] = []
  if (filters.category) parts.push(pb.filter('category = {:category}', { category: filters.category }))
  if (filters.search) {
    parts.push(pb.filter(
      '(title ~ {:q} || description ~ {:q} || tags ~ {:q})',
      { q: filters.search },
    ))
  }
  return parts.join(' && ')
}

export function nextPageParam(lastPage: ListResult<HealthRecord>): number | undefined {
  return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
}

export function useRecords(filters: RecordFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['records', filters] as const,
    queryFn: ({ pageParam }) =>
      pb.collection('records').getList<HealthRecord>(pageParam, PER_PAGE, {
        sort: '-date',
        filter: buildFilter(filters),
      }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: pb.authStore.isValid,
    // When the filters change, keep showing the previous list (with the
    // search spinner on) instead of flashing the empty loading state.
    placeholderData: keepPreviousData,
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
