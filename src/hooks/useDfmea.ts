import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dfmeaService } from '@/services/dfmea.service'
import type { DfmeaRecord } from '@/types'

export const DFMEA_QUERY_KEY = ['dfmea', 'records']

/** Fetch all DFMEA records */
export function useDfmeaData() {
  return useQuery({
    queryKey: DFMEA_QUERY_KEY,
    queryFn: dfmeaService.getAll,
    staleTime: 5 * 60 * 1000, // 5 min cache
    select: (res) => res.data,
  })
}

/** Derive unique programs from data */
export function usePrograms(data?: DfmeaRecord[]) {
  if (!data) return []
  return [...new Set(data.map((r) => r.program))].sort()
}

/** Derive unique product categories (campaign) filtered by program */
export function useProductCategories(data?: DfmeaRecord[], program?: string) {
  if (!data || !program) return []
  return [...new Set(data.filter((r) => r.program === program).map((r) => r.campaign))].sort()
}

/** Derive unique subsystems filtered by program + campaign */
export function useSubsystems(data?: DfmeaRecord[], program?: string, campaign?: string) {
  if (!data || !program || !campaign) return []
  return [
    ...new Set(
      data.filter((r) => r.program === program && r.campaign === campaign).map((r) => r.subsystem)
    ),
  ].sort()
}

/** Derive unique products filtered by program + campaign + subsystem */
export function useProducts(
  data?: DfmeaRecord[],
  program?: string,
  campaign?: string,
  subsystem?: string
) {
  if (!data || !program || !campaign || !subsystem) return []
  return [
    ...new Set(
      data
        .filter(
          (r) =>
            r.program === program && r.campaign === campaign && r.subsystem === subsystem
        )
        .map((r) => r.product)
    ),
  ].sort()
}

/** Mutation to save DFMEA */
export function useSaveDfmea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dfmeaService.saveDfmea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DFMEA_QUERY_KEY })
    },
  })
}

/** Mutation to upload files */
export function useUploadFiles() {
  return useMutation({
    mutationFn: dfmeaService.uploadFiles,
  })
}
