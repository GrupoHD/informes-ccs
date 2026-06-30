import { useRef, useEffect } from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconName } from '@fortawesome/fontawesome-svg-core'
import StatusSelect from '../ui/StatusSelect'
import type { ChecklistItem, StatusValue } from '../../types/report'

library.add(fas)

function iconName(raw: string): IconName {
  // Convert camelCase icon name to kebab-case FA icon name
  return raw.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^fa-?/, '') as IconName
}

interface Props {
  item:     ChecklistItem
  globalIndex: number
  onChange: (status: StatusValue, detail: string) => void
}

export default function ChecklistRow({ item, globalIndex, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isNok = item.status === 'NOK'

  useEffect(() => {
    if (isNok && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isNok])

  return (
    <div className="row-item">
      <div className="row-flex">
        <div className="label-box">
          <FontAwesomeIcon icon={['fas', iconName(item.icon)]} className="label-icon" />
          <span className="label-text">{item.label}</span>
          <div className="label-dots" />
        </div>
        <StatusSelect
          id={`status-${globalIndex}`}
          value={item.status}
          onChange={status => onChange(status, status !== 'NOK' ? '' : item.detail)}
        />
      </div>

      <div className={`motive-box${isNok ? ' active' : ''}`}>
        <textarea
          ref={textareaRef}
          className="motive-input"
          rows={2}
          placeholder="Describa la incidencia al detalle (Obligatorio)..."
          value={item.detail}
          onChange={e => onChange(item.status, e.target.value)}
        />
      </div>
    </div>
  )
}
