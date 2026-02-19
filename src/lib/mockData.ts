import type { FmeaRow } from '@/types'

const COMPONENTS = ['Housing Assembly', 'PCB Module', 'Display Unit', 'Connector', 'Seal']
const FUNCTIONS = [
  'Provide structural support',
  'Process signals',
  'Display information',
  'Enable connectivity',
  'Protect internals',
]
const FAILURE_MODES = [
  'Crack / fracture',
  'Short circuit',
  'Pixel failure',
  'Loose connection',
  'Seal leak',
]
const EFFECTS = [
  'Unit inoperable',
  'Data loss',
  'No display',
  'Intermittent operation',
  'Moisture ingress',
]

export function generateMockFmeaRows(
  productCategory: string,
  subsystem: string,
  product: string,
  count = 8
): FmeaRow[] {
  return Array.from({ length: count }, (_, i) => ({
    productCategory,
    product,
    subsystem,
    component: COMPONENTS[i % COMPONENTS.length],
    function: FUNCTIONS[i % FUNCTIONS.length],
    failureMode: FAILURE_MODES[i % FAILURE_MODES.length],
    effect: EFFECTS[i % EFFECTS.length],
    severity: Math.floor(Math.random() * 5) + 4,
    occurrence: Math.floor(Math.random() * 4) + 2,
    detection: Math.floor(Math.random() * 4) + 2,
    feedback: null,
  }))
}
