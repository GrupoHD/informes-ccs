import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignature, faCircleNotch, faRobot } from '@fortawesome/free-solid-svg-icons'
import type { ReportHeader } from '../../types/report'

interface Props {
  obs:          string
  firma:        string
  isSubmitting: boolean
  submitError:  string
  onChange:     (field: keyof ReportHeader, value: string) => void
  onSubmit:     () => void
  onAutoFill?:  () => void
}

export default function ValidationCard({ obs, firma, isSubmitting, submitError, onChange, onSubmit, onAutoFill }: Props) {
  return (
    <div className="card">
      <div className="card-title">
        <FontAwesomeIcon icon={faSignature} className="card-icon" />
        Validación y Cierre
        {onAutoFill && (
          <button className="btn-autofill" onClick={onAutoFill} title="Rellenar automáticamente">
            <FontAwesomeIcon icon={faRobot} /> Rellenar
          </button>
        )}
      </div>

      <div>
        <label className="field-label">Observaciones Extraordinarias (Opcional)</label>
        <textarea
          id="f-obs"
          className="control"
          rows={4}
          style={{ resize: 'vertical' }}
          placeholder="Redacte incidencias destacables, notas de mantenimiento..."
          value={obs}
          onChange={e => onChange('obs', e.target.value)}
        />
      </div>

      <div className="signature-wrap">
        <label className="signature-label">Firma Digital del Operario</label>
        <input
          id="f-firma"
          type="text"
          className="signature-input"
          placeholder="Haga clic y escriba su nombre completo para firmar"
          value={firma}
          onChange={e => { e.target.classList.remove('error'); onChange('firma', e.target.value) }}
        />
      </div>

      {submitError && (
        <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: 12, fontWeight: 500 }}>
          Error: {submitError}
        </p>
      )}

      <button className="btn-primary" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting
          ? <><FontAwesomeIcon icon={faCircleNotch} spin /> PROCESANDO ENVÍO SEGURO...</>
          : 'VALIDAR Y ENVIAR REPORTE'}
      </button>
    </div>
  )
}
