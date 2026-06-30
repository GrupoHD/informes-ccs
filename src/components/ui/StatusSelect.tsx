import type { StatusValue } from '../../types/report'

interface Props {
  id:       string
  value:    StatusValue
  onChange: (v: StatusValue) => void
}

export default function StatusSelect({ id, value, onChange }: Props) {
  const cls = value === 'OK' ? 'ok' : value === 'NOK' ? 'nok' : value === 'N/A' ? 'na' : ''

  return (
    <select
      id={id}
      className={`status-select ${cls}`}
      value={value}
      onChange={e => {
        e.currentTarget.classList.remove('error')
        onChange(e.target.value as StatusValue)
      }}
    >
      <option value="">-</option>
      <option value="OK">OK</option>
      <option value="NOK">NOK</option>
      <option value="N/A">N/A</option>
    </select>
  )
}
