import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignature, faCircleNotch, faRobot, faCamera, faXmark, faImage } from '@fortawesome/free-solid-svg-icons'
import type { ReportHeader } from '../../types/report'

interface Props {
  obs:            string
  firma:          string
  isSubmitting:   boolean
  submitError:    string
  onChange:       (field: keyof ReportHeader, value: string) => void
  onSubmit:       () => void
  onAutoFill?:    () => void
  attachedImages: File[]
  onImagesChange: (images: File[]) => void
}

export default function ValidationCard({
  obs, firma, isSubmitting, submitError,
  onChange, onSubmit, onAutoFill,
  attachedImages, onImagesChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    onImagesChange([...attachedImages, ...files])
    e.target.value = ''
  }

  function removeImage(index: number) {
    onImagesChange(attachedImages.filter((_, i) => i !== index))
  }

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

      {/* ─── IMAGE ATTACHMENTS ─── */}
      <div className="images-section">
        <label className="field-label" style={{ marginBottom: 12 }}>
          <FontAwesomeIcon icon={faCamera} style={{ marginRight: 6 }} />
          Imágenes Adjuntas (Opcional)
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFilesSelected}
        />

        {attachedImages.length > 0 && (
          <div className="image-preview-grid">
            {attachedImages.map((file, i) => (
              <div key={i} className="image-preview-item">
                <img src={URL.createObjectURL(file)} alt={file.name} />
                <button
                  className="image-preview-remove"
                  onClick={() => removeImage(i)}
                  title="Eliminar imagen"
                  type="button"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn-upload-images"
          onClick={() => fileInputRef.current?.click()}
          type="button"
          disabled={isSubmitting}
        >
          <FontAwesomeIcon icon={faImage} />
          {attachedImages.length === 0
            ? 'Añadir imágenes'
            : `${attachedImages.length} imagen${attachedImages.length > 1 ? 'es' : ''} · Añadir más`}
        </button>
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
