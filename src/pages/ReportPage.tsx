import type { User } from 'firebase/auth'
import { useReport } from '../hooks/useReport'
import { useProgress } from '../hooks/useProgress'
import { useAuth } from '../hooks/useAuth'
import Sidebar from '../components/layout/Sidebar'
import MobileHeader from '../components/layout/MobileHeader'
import ServiceParamsCard from '../components/form/ServiceParamsCard'
import ChecklistCard from '../components/form/ChecklistCard'
import RoundsCard from '../components/form/RoundsCard'
import ValidationCard from '../components/form/ValidationCard'
import SuccessModal from '../components/ui/SuccessModal'
import { faShieldAlt, faBroom } from '@fortawesome/free-solid-svg-icons'
import type { ReportHeader, StatusValue } from '../types/report'

interface Props {
  user: User
  onNavigateAdmin?: () => void
}

export default function ReportPage({ user, onNavigateAdmin }: Props) {
  const { role, gestorCenter, canEditStructure, signOut } = useAuth()

  const {
    header, updateHeader, lockedCenter,
    security, cleaning, rounds, updateItem,
    addItem, removeItem, renameItem,
    addRound, removeRound,
    isSubmitting, showModal, submitError,
    submitReport, resetForm,
  } = useReport(user)

  const progress  = useProgress(security, cleaning, rounds)
  const canEdit   = role === 'admin' || role === 'gestor' || canEditStructure
  const isAdmin   = role === 'admin'

  function autoFillParams() {
    if (!header.turno)       updateHeader('turno', 'Mañana')
    if (!header.responsable) updateHeader('responsable', 'Operario Prueba')
  }

  function autoFillChecklist(type: 'security' | 'cleaning') {
    const items = type === 'security' ? security : cleaning
    items.forEach((_, i) => updateItem(type, i, 'OK', ''))
  }

  function autoFillRounds() {
    rounds.forEach((_, i) => updateItem('rounds', i, 'OK', ''))
  }

  function autoFillValidation() {
    if (!header.obs)  updateHeader('obs', 'Sin incidencias destacables.')
    if (!header.firma) updateHeader('firma', user.displayName ?? user.email ?? 'Admin')
  }

  return (
    <div className="app-layout">
      <MobileHeader />

      <Sidebar
        centro={header.centro}
        lockedCenter={lockedCenter}
        onCentroChange={v => updateHeader('centro' as keyof ReportHeader, v)}
        progress={progress}
        role={role}
        gestorCenter={gestorCenter}
        userEmail={user.email ?? ''}
        onSignOut={signOut}
        onNavigateAdmin={onNavigateAdmin}
      />

      <main className="main-wrapper">
        <div className="content-max">
          <header><h1>Gestión Operativa de Turno</h1></header>

          <ServiceParamsCard
            header={header}
            lockedCenter={lockedCenter}
            onChange={(field: keyof ReportHeader, value: string) => updateHeader(field, value)}
            onAutoFill={isAdmin ? autoFillParams : undefined}
          />

          <ChecklistCard
            title="Auditoría de Seguridad"
            icon={faShieldAlt}
            items={security}
            indexOffset={0}
            canEdit={canEdit}
            onChange={(i: number, status: StatusValue, detail: string) => updateItem('security', i, status, detail)}
            onAutoFill={isAdmin ? () => autoFillChecklist('security') : undefined}
            onAddItem={(label: string) => addItem('security', label)}
            onRemoveItem={(i: number) => removeItem('security', i)}
            onRenameItem={(i: number, label: string) => renameItem('security', i, label)}
          />

          <ChecklistCard
            title="Estándares de Limpieza"
            icon={faBroom}
            items={cleaning}
            indexOffset={security.length}
            canEdit={canEdit}
            onChange={(i: number, status: StatusValue, detail: string) => updateItem('cleaning', i, status, detail)}
            onAutoFill={isAdmin ? () => autoFillChecklist('cleaning') : undefined}
            onAddItem={(label: string) => addItem('cleaning', label)}
            onRemoveItem={(i: number) => removeItem('cleaning', i)}
            onRenameItem={(i: number, label: string) => renameItem('cleaning', i, label)}
          />

          <RoundsCard
            rounds={rounds}
            indexOffset={security.length + cleaning.length}
            canEdit={canEdit}
            onChange={(i: number, status: StatusValue, detail: string) => updateItem('rounds', i, status, detail)}
            onAutoFill={isAdmin ? autoFillRounds : undefined}
            onAddRound={addRound}
            onRemoveRound={removeRound}
          />

          <ValidationCard
            obs={header.obs}
            firma={header.firma}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onChange={(field: keyof ReportHeader, value: string) => updateHeader(field, value)}
            onSubmit={submitReport}
            onAutoFill={isAdmin ? autoFillValidation : undefined}
          />

          {showModal && <SuccessModal onReset={resetForm} />}
        </div>
      </main>
    </div>
  )
}
