import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dfmeaService } from "@/services/dfmea.service";
import type { DfmeaRecord } from "@/types";

export const DFMEA_QUERY_KEY = ["dfmea", "records"];

/** Fetch all DFMEA records */
export function useDfmeaData() {
  return useQuery({
    queryKey: DFMEA_QUERY_KEY,
    queryFn: dfmeaService.getAll,
    staleTime: 5 * 60 * 1000, // 5 min cache
    select: (res) => res.data,
  });
}

/** Derive unique programs from data */
export function usePrograms(data?: DfmeaRecord[]) {
  if (!data) return [];
  return [...new Set(data.map((r) => r.program))].sort();
}

/** Derive unique product categories (campaign) filtered by program */
export function useProductCategories(
  data?: DfmeaRecord[],
  program?: string | string[],
) {
  if (!data) return [];
  const programValue = Array.isArray(program) ? program[0] : program;
  if (!programValue) return [];
  return [
    ...new Set(
      data.filter((r) => r.program === programValue).map((r) => r.campaign),
    ),
  ].sort();
}

/** Derive unique subsystems filtered by program + campaign */
export function useSubsystems(
  data?: DfmeaRecord[],
  program?: string | string[],
  campaign?: string | string[],
) {
  if (!data) return [];
  const programValue = Array.isArray(program) ? program[0] : program;
  const campaignValue = Array.isArray(campaign) ? campaign[0] : campaign;
  if (!programValue || !campaignValue) return [];
  return [
    ...new Set(
      data
        .filter(
          (r) => r.program === programValue && r.campaign === campaignValue,
        )
        .map((r) => r.subsystem),
    ),
  ].sort();
}

/** Derive unique products filtered by program + campaign + subsystem */
export function useProducts(
  data?: DfmeaRecord[],
  program?: string | string[],
  campaign?: string | string[],
  subsystem?: string | string[],
) {
  if (!data) return [];
  const programValue = Array.isArray(program) ? program[0] : program;
  const campaignValue = Array.isArray(campaign) ? campaign[0] : campaign;
  const subsystemValue = Array.isArray(subsystem) ? subsystem[0] : subsystem;
  if (!programValue || !campaignValue || !subsystemValue) return [];
  return [
    ...new Set(
      data
        .filter(
          (r) =>
            r.program === programValue &&
            r.campaign === campaignValue &&
            r.subsystem === subsystemValue,
        )
        .map((r) => r.product),
    ),
  ].sort();
}

/** Mutation to save DFMEA */
export function useSaveDfmea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dfmeaService.saveDfmea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DFMEA_QUERY_KEY });
    },
  });
}

/** Mutation to upload files */
export function useUploadFiles() {
  return useMutation({
    mutationFn: dfmeaService.uploadFiles,
  });
}
