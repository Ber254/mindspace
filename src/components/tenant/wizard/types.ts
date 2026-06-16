import type { Professional, Franja } from '@/lib/types'

export type WizardStep =
  | 'fecha'
  | 'profesional'
  | 'horario'
  | 'datos'
  | 'pago'
  | 'confirmacion'

export interface WizardState {
  step: WizardStep
  preselectedProfId: string | null   // Si se abre desde la card de un profesional
  selectedDate: string | null        // YYYY-MM-DD
  selectedProf: Professional | null
  selectedHora: string | null
  selectedFranja: Franja | null
  patientNombre: string
  patientCelular: string
  patientOS: string
  patientEmail: string
}

export const WIZARD_INITIAL: WizardState = {
  step: 'fecha',
  preselectedProfId: null,
  selectedDate: null,
  selectedProf: null,
  selectedHora: null,
  selectedFranja: null,
  patientNombre: '',
  patientCelular: '',
  patientOS: '',
  patientEmail: '',
}

export interface SlotInfo {
  hora: string
  franja: Franja
  available: boolean
}
