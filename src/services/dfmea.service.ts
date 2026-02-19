import apiClient from './apiClient'
import type { ApiResponse } from '@/types'

export const dfmeaService = {
  /** Fetch all DFMEA records */
  getAll: async (): Promise<ApiResponse> => {
    const { data } = await apiClient.get<ApiResponse>('')
    return data
  },

  /** Save DFMEA (simulated – npoint is read-only) */
  saveDfmea: async (payload: unknown): Promise<{ success: boolean }> => {
    // In production this would be a real POST
    console.log('Saving DFMEA payload:', payload)
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800))
  },

  /** Upload files (simulated) */
  uploadFiles: async (formData: FormData): Promise<{ success: boolean }> => {
    console.log('Uploading files:', formData)
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1200))
  },
}
