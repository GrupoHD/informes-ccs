export type UserRole = 'admin' | 'gestor' | 'operario'

export type StatusValue = 'OK' | 'NOK' | 'N/A' | ''

export interface ChecklistItem {
  label: string
  icon: string
  status: StatusValue
  detail: string
}

export interface ReportHeader {
  centro: string
  fecha: string
  turno: 'Mañana' | 'Tarde' | 'Noche' | ''
  responsable: string
  obs: string
  firma: string
}

export interface ReportPayload {
  header: ReportHeader
  security: ChecklistItem[]
  cleaning: ChecklistItem[]
  rounds: ChecklistItem[]
  submittedAt: string
  submittedBy: string
}
