import { useState } from 'react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt, faCheck, faTimes, faPlus, faRobot } from '@fortawesome/free-solid-svg-icons'
import ChecklistRow from './ChecklistRow'
import type { ChecklistItem, StatusValue } from '../../types/report'

interface Props {
  title:         string
  icon:          IconDefinition
  items:         ChecklistItem[]
  indexOffset:   number
  canEdit?:      boolean
  onChange:      (index: number, status: StatusValue, detail: string) => void
  onAutoFill?:   () => void
  onAddItem?:    (label: string) => void
  onRemoveItem?: (index: number) => void
  onRenameItem?: (index: number, label: string) => void
}

export default function ChecklistCard({
  title, icon, items, indexOffset, canEdit = false,
  onChange, onAutoFill, onAddItem, onRemoveItem, onRenameItem,
}: Props) {
  const [editMode, setEditMode]       = useState(false)
  const [newLabel, setNewLabel]       = useState('')
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null)
  const [renameVal, setRenameVal]     = useState('')

  function confirmRename(i: number) {
    if (renameVal.trim()) onRenameItem?.(i, renameVal.trim())
    setRenamingIdx(null)
    setRenameVal('')
  }

  function confirmAdd() {
    if (newLabel.trim()) { onAddItem?.(newLabel.trim()); setNewLabel('') }
  }

  return (
    <div className="card">
      <div className="card-title">
        <FontAwesomeIcon icon={icon} className="card-icon" />
        {title}
        {onAutoFill && (
          <button className="btn-autofill" onClick={onAutoFill} title="Rellenar automáticamente">
            <FontAwesomeIcon icon={faRobot} /> Rellenar
          </button>
        )}
        {canEdit && (
          <button
            className={`btn-edit-toggle${editMode ? ' active' : ''}`}
            onClick={() => setEditMode(v => !v)}
            title={editMode ? 'Cerrar edición' : 'Editar estructura'}
          >
            <FontAwesomeIcon icon={faPencilAlt} />
            {editMode ? ' Cerrar edición' : ' Editar estructura'}
          </button>
        )}
      </div>

      {editMode && <div className="edit-mode-bar">Modo edición activo — puedes añadir, eliminar o renombrar ítems</div>}

      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="row-item-wrapper">
          {editMode && renamingIdx === i ? (
            <div className="rename-row">
              <input
                className="control rename-input"
                value={renameVal}
                autoFocus
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmRename(i); if (e.key === 'Escape') setRenamingIdx(null) }}
              />
              <button className="btn-icon-confirm" onClick={() => confirmRename(i)} title="Confirmar"><FontAwesomeIcon icon={faCheck} /></button>
              <button className="btn-icon-cancel"  onClick={() => setRenamingIdx(null)} title="Cancelar"><FontAwesomeIcon icon={faTimes} /></button>
            </div>
          ) : (
            <div className="row-with-actions">
              <ChecklistRow
                item={item}
                globalIndex={indexOffset + i}
                onChange={(status, detail) => onChange(i, status, detail)}
              />
              {editMode && (
                <div className="edit-actions">
                  <button
                    className="btn-icon-rename"
                    onClick={() => { setRenamingIdx(i); setRenameVal(item.label) }}
                    title="Renombrar"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                  <button
                    className="btn-icon-remove"
                    onClick={() => onRemoveItem?.(i)}
                    title="Eliminar ítem"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {editMode && (
        <div className="add-item-row">
          <input
            className="control add-item-input"
            placeholder="Nombre del nuevo ítem..."
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmAdd() }}
          />
          <button className="btn-icon-add" onClick={confirmAdd} title="Añadir ítem">
            <FontAwesomeIcon icon={faPlus} /> Añadir
          </button>
        </div>
      )}
    </div>
  )
}
