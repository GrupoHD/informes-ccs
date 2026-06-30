import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt, faLock, faSignOutAlt, faUsers } from '@fortawesome/free-solid-svg-icons'
import ProgressCircle from './ProgressCircle'
import { useConfig } from '../../context/ConfigContext'
import type { UserRole } from '../../types/report'

interface Props {
  centro:            string
  lockedCenter:      string | null
  onCentroChange:    (v: string) => void
  progress:          number
  role:              UserRole
  gestorCenter:      string | null
  userEmail:         string
  onSignOut:         () => void
  onNavigateAdmin?:  () => void
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin:    'Admin',
  gestor:   'Gestor',
  operario: 'Operario',
}

export default function Sidebar({
  centro, lockedCenter, onCentroChange, progress,
  role, userEmail, onSignOut, onNavigateAdmin,
}: Props) {
  const { mailRouting } = useConfig()
  const CENTER_OPTIONS = Object.keys(mailRouting)

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-css-wrapper">
          <p className="logo-hd-text">HD</p>
          <p className="logo-grupo-text">GRUPO</p>
        </div>
      </div>

      <div className="center-selector-wrapper">
        <label>
          <FontAwesomeIcon icon={faMapMarkerAlt} /> Centro de Trabajo
        </label>

        {lockedCenter ? (
          <div className="center-locked">
            <FontAwesomeIcon icon={faLock} style={{ opacity: .7 }} />
            {lockedCenter}
          </div>
        ) : (
          <select
            className="center-select"
            value={centro}
            onChange={e => onCentroChange(e.target.value)}
          >
            <option value="">Seleccionar Centro Comercial...</option>
            {CENTER_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      <div className="user-info-box">
        <div className="user-email">{userEmail}</div>
        <span className={`role-badge role-badge--${role}`}>{ROLE_LABEL[role]}</span>
        <button className="btn-signout" onClick={onSignOut} title="Cerrar sesión">
          <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
        </button>
      </div>

      {onNavigateAdmin && (
        <div className="sidebar-nav">
          <button className="btn-nav" onClick={onNavigateAdmin}>
            <FontAwesomeIcon icon={faUsers} />
            Gestionar Usuarios
          </button>
        </div>
      )}

      <div className="nav-stats">
        <ProgressCircle pct={progress} />
        <p className="stat-label">Estado Operativo</p>
      </div>
    </aside>
  )
}
