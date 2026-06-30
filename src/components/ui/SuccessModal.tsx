import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

interface Props {
  onReset: () => void
}

export default function SuccessModal({ onReset }: Props) {
  return (
    <div className="overlay active">
      <div className="success-card">
        <div className="success-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <h2>Registro Exitoso</h2>
        <p>
          El informe ha sido validado, archivado en Drive y notificado al Centro Comercial correspondiente.
        </p>
        <button className="btn-primary btn-green" style={{ marginTop: 0 }} onClick={onReset}>
          INICIAR NUEVO TURNO
        </button>
      </div>
    </div>
  )
}
