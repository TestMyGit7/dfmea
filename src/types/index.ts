// User / Auth types
export type UserRole = 'viewer' | 'engineer' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
}

// API data types
export interface DfmeaRecord {
  product: string
  program: string
  campaign: string
  subsystem: string
}

export interface ApiResponse {
  data: DfmeaRecord[]
  count: number
  status: string
}

// Dropdown selection state
export interface DropdownSelection {
  program: string
  productCategory: string
  subsystem: string
  product: string
}

// FMEA table row type
export interface FmeaRow {
  productCategory: string
  product: string
  subsystem: string
  component: string
  function: string
  failureMode: string
  effect: string
  severity: number
  occurrence: number
  detection: number
  rpn?: number
  feedback?: 'up' | 'down' | null
}

export interface UploadFormData {
  programme: string
  productCategory: string
  subsystem: string
  product: string
  prdFiles: File[]
  kbFiles: File[]
  fieldRepairFiles: File[]
}
