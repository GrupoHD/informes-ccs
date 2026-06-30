import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPencilAlt, faTimes, faPlus, faRobot } from '@fortawesome/free-solid-svg-icons'
import ChecklistRow from './ChecklistRow'
import type { ChecklistItem, StatusValue } from '../../types/report'

interface Props {
  rounds:         ChecklistItem[]
  indexOffset:    number
  canEdit?:       boolean
  onChange:       (index: number, status: StatusValue, detail: string) => void
  onAutoFill?:    () => void
  onAddRound?:    (hour: string) => void
  onRemoveRound?: (index: number) => void
}

export default function RoundsCard({ rounds, indexOffset, canEdit = false, onChange, onAutoFill, onAddRound, onRemoveRound }: Props) {
  const [editMode, setEditMode] = useState(false)
  const [newHour, setNewHour]   = useState('')

  function confirmAdd() {
    if (newHour.trim()) { onAddRound?.(newHour.trim()); setNewHour('') }
  }

  return (
    <div className="card">
      <div className="card-title">
        <FontAwesomeIcon icon={faClock} className="card-icon" />
        Rondas Horarias
        {onAutoFill && (
          <button className="btn-autofill" onClick={onAutoFill} title="Rellenar automáticamente">
            <FontAwesomeIcon icon={faRobot} /> Rellenar
          </button>
        )}
        {canEdit && (
          <button
            className={`btn-edit-toggle${editMode ? ' active' : ''}`}
            onClick={() => setEditMode(v => !v)}
            title={editMode ? 'Cerrar edición' : 'Editar rondas'}
          >
            <FontAwesomeIcon icon={faPencilAlt} />
            {editMode ? ' Cerrar edición' : ' Editar rondas'}
          </button>
        )}
      </div>

      {editMode && <div className="edit-mode-bar">Modo edición — añade o elimina franjas horarias</div>}

      <div className="rounds-grid">
        {rounds.map((item, i) => (
          <div key={`${item.label}-${i}`} className={`row-with-actions${editMode ? ' in-edit' : ''}`}>
            <ChecklistRow
              item={item}
              globalIndex={indexOffset + i}
              onChange={(status, detail) => onChange(i, status, detail)}
            />
            {editMode && (
              <div className="edit-actions">
                <button
                  className="btn-icon-remove"
                  onClick={() => onRemoveRound?.(i)}
                  title="Eliminar ronda"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editMode && (
        <div className="add-item-row" style={{ marginTop: 15 }}>
          <input
            className="control add-item-input"
            placeholder="Hora (ej. 22:30)..."
            value={newHour}
            onChange={e => setNewHour(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmAdd() }}
          />
          <button className="btn-icon-add" onClick={confirmAdd} title="Añadir ronda">
            <FontAwesomeIcon icon={faPlus} /> Añadir
          </button>
        </div>
      )}
    </div>
  )
}
