import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList, faMapMarkerAlt, faRobot } from '@fortawesome/free-solid-svg-icons'
import type { ReportHeader } from '../../types/report'
import { useConfig } from '../../context/ConfigContext'

interface Props {
  header:        ReportHeader
  lockedCenter:  string | null
  onChange:      (field: keyof ReportHeader, value: string) => void
  onAutoFill?:   () => void
}

export default function ServiceParamsCard({ header, lockedCenter, onChange, onAutoFill }: Props) {
  const { mailRouting } = useConfig()
  const CENTER_OPTIONS = Object.keys(mailRouting)

  return (
    <div className="card">
      <div className="card-title">
        <FontAwesomeIcon icon={faClipboardList} className="card-icon" />
        Parámetros de Servicio
        {onAutoFill && (
          <button className="btn-autofill" onClick={onAutoFill} title="Rellenar automáticamente">
            <FontAwesomeIcon icon={faRobot} /> Rellenar
          </button>
        )}
      </div>

      <div className="params-grid">
        <div className="mobile-center-field">
          <label className="field-label">
            <FontAwesomeIcon icon={faMapMarkerAlt} /> Centro de Trabajo
          </label>
          {lockedCenter ? (
            <input className="control" value={lockedCenter} readOnly />
          ) : (
            <select
              id="f-centro"
              className="control"
              value={header.centro}
              onChange={e => { e.target.classList.remove('error'); onChange('centro', e.target.value) }}
            >
              <option value="">Seleccionar Centro...</option>
              {CENTER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        <div>
          <label className="field-label">Fecha</label>
          <input
            id="f-fecha"
            type="date"
            className="control"
            value={header.fecha}
            onChange={e => { e.target.classList.remove('error'); onChange('fecha', e.target.value) }}
          />
        </div>

        <div>
          <label className="field-label">Turno</label>
          <select
            id="f-turno"
            className="control"
            value={header.turno}
            onChange={e => { e.target.classList.remove('error'); onChange('turno', e.target.value) }}
          >
            <option value="">Seleccionar...</option>
            <option>Mañana</option>
            <option>Tarde</option>
            <option>Noche</option>
          </select>
        </div>

        <div>
          <label className="field-label">Nombre del Operario</label>
          <input
            id="f-responsable"
            type="text"
            className="control"
            placeholder="Escriba su nombre completo..."
            value={header.responsable}
            onChange={e => { e.target.classList.remove('error'); onChange('responsable', e.target.value) }}
          />
        </div>
      </div>
    </div>
  )
}
