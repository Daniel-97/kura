import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { Category, CategoryColor, HealthRecord } from '@/lib/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'] as const,
    queryFn: () => pb.collection('categories').getFullList<Category>({ sort: 'name' }),
    enabled: pb.authStore.isValid,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: CategoryColor; user: string }) =>
      pb.collection('categories').create<Category>(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['records'] })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pb.collection('categories').delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['records'] })
    },
  })
}

export function useCategoryCounts(): Record<string, number> | undefined {
  const { data } = useQuery({
    queryKey: ['categoryCounts'] as const,
    queryFn: () =>
      pb.collection('records').getFullList<Pick<HealthRecord, 'category'>>({ fields: 'category' }),
    enabled: pb.authStore.isValid,
    select: (records) => {
      const counts: Record<string, number> = {}
      for (const r of records) {
        const key = r.category ?? ''
        counts[key] = (counts[key] ?? 0) + 1
      }
      return counts
    },
  })
  return data
}
