import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faUsers, faPlus, faEdit, faTrash,
  faSave, faTimes, faUserShield, faUserTie, faUser, faPencilRuler,
} from '@fortawesome/free-solid-svg-icons'
import { useUsers } from '../hooks/useUsers'
import { useConfig } from '../context/ConfigContext'
import type { UserRole } from '../types/report'
import type { UserEntry } from '../hooks/useUsers'

interface Props { onBack: () => void }

const ROLE_LABEL: Record<UserRole, string> = {
  admin:    'Admin',
  gestor:   'Gestor',
  operario: 'Operario',
}
const ROLE_ICONS = {
  admin:    faUserShield,
  gestor:   faUserTie,
  operario: faUser,
}

const ROLE_CAPABILITIES: Record<UserRole, string[]> = {
  admin:    ['Ver y editar todos los informes', 'Gestionar usuarios y configuración', 'Editar estructura del formulario', 'Rellenar cualquier informe'],
  gestor:   ['Ver y enviar informes de su centro asignado', 'Editar estructura del formulario', 'Rellenar informes de su centro'],
  operario: ['Rellenar informes de su turno', 'Ver sus propios informes enviados'],
}

const emptyForm = { email: '', role: 'operario' as UserRole, centro: '', canEditStructure: false }

export default function AdminPage({ onBack }: Props) {
  const { users, loading, addUser, updateUser, removeUser } = useUsers()
  const { mailRouting } = useConfig()
  const centers = Object.keys(mailRouting)

  const [showAdd,      setShowAdd]      = useState(false)
  const [editEntry,    setEditEntry]    = useState<UserEntry | null>(null)
  const [deleteEmail,  setDeleteEmail]  = useState<string | null>(null)
  const [form,         setForm]         = useState(emptyForm)
  const [saving,       setSaving]       = useState(false)
  const [errorMsg,     setErrorMsg]     = useState('')

  const adminCount  = users.filter(u => u.role === 'admin').length
  const gestorCount = users.filter(u => u.role === 'gestor').length

  function openAdd() {
    setForm(emptyForm)
    setErrorMsg('')
    setShowAdd(true)
  }

  function openEdit(u: UserEntry) {
    setForm({ email: u.email, role: u.role, centro: u.centro ?? '', canEditStructure: u.canEditStructure ?? false })
    setErrorMsg('')
    setEditEntry(u)
  }

  function validate() {
    if (!form.email.trim())                        return 'Email requerido'
    if (!/\S+@\S+\.\S+/.test(form.email.trim()))  return 'Email inválido'
    if (form.role === 'gestor' && !form.centro)    return 'Selecciona un centro para el gestor'
    return ''
  }

  async function handleAdd() {
    const err = validate()
    if (err) { setErrorMsg(err); return }
    setSaving(true); setErrorMsg('')
    try {
      await addUser(form.email.trim().toLowerCase(), form.role, form.centro || undefined, form.canEditStructure || undefined)
      setShowAdd(false)
    } catch { setErrorMsg('Error al guardar. Intenta de nuevo.') }
    finally  { setSaving(false) }
  }

  async function handleEdit() {
    const err = validate()
    if (err) { setErrorMsg(err); return }
    setSaving(true); setErrorMsg('')
    try {
      await updateUser(form.email.trim().toLowerCase(), form.role, form.centro || undefined, form.canEditStructure || undefined)
      setEditEntry(null)
    } catch { setErrorMsg('Error al guardar. Intenta de nuevo.') }
    finally  { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteEmail) return
    setSaving(true)
    try {
      await removeUser(deleteEmail)
    } finally {
      setDeleteEmail(null)
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <button className="btn-back" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al informe
        </button>
        <h1>
          <FontAwesomeIcon icon={faUsers} />
          Gestión de Usuarios
        </h1>
        <button className="btn-add-user" onClick={openAdd}>
          <FontAwesomeIcon icon={faPlus} /> Nuevo usuario
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <FontAwesomeIcon icon={faUserShield} className="stat-icon stat-icon--admin" />
          <div>
            <div className="stat-num">{adminCount}</div>
            <div className="stat-name">Administradores</div>
          </div>
        </div>
        <div className="stat-card">
          <FontAwesomeIcon icon={faUserTie} className="stat-icon stat-icon--gestor" />
          <div>
            <div className="stat-num">{gestorCount}</div>
            <div className="stat-name">Gestores</div>
          </div>
        </div>
        <div className="stat-card">
          <FontAwesomeIcon icon={faUsers} className="stat-icon stat-icon--total" />
          <div>
            <div className="stat-num">{users.length}</div>
            <div className="stat-name">Total configurados</div>
          </div>
        </div>
      </div>

      {/* User table */}
      <div className="card admin-table-card">
        <div className="card-title">
          <FontAwesomeIcon icon={faUsers} className="card-icon" />
          Usuarios configurados
        </div>

        {loading ? (
          <div className="admin-loading">Cargando usuarios…</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            No hay usuarios configurados. Los usuarios sin rol asignado son operarios.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Centro</th>
                  <th>Editar estructura</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email}>
                    <td className="td-email">{u.email}</td>
                    <td>
                      <span className={`role-badge role-badge--${u.role}`}>
                        <FontAwesomeIcon icon={ROLE_ICONS[u.role]} />
                        {' '}{ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="td-centro">{u.centro ?? <span className="td-none">—</span>}</td>
                    <td className="td-canedit">
                      {u.canEditStructure
                        ? <span className="canedit-badge"><FontAwesomeIcon icon={faPencilRuler} /> Sí</span>
                        : <span className="td-none">—</span>}
                    </td>
                    <td className="td-actions">
                      <button className="btn-table-action btn-edit" onClick={() => openEdit(u)} title="Editar">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="btn-table-action btn-delete" onClick={() => setDeleteEmail(u.email)} title="Eliminar">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note about operarios */}
      <p className="admin-note">
        Los usuarios que inicien sesión con Google y no estén en esta lista tendrán rol <strong>Operario</strong> automáticamente.
      </p>

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FontAwesomeIcon icon={faPlus} /> Nuevo usuario</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <UserForm
              form={form}
              onChange={setForm}
              centers={centers}
              error={errorMsg}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleAdd} disabled={saving}>
                <FontAwesomeIcon icon={faSave} /> {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editEntry && (
        <div className="modal-overlay" onClick={() => setEditEntry(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FontAwesomeIcon icon={faEdit} /> Editar usuario</h2>
              <button className="modal-close" onClick={() => setEditEntry(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <UserForm
              form={form}
              onChange={setForm}
              centers={centers}
              error={errorMsg}
              emailReadOnly
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditEntry(null)}>Cancelar</button>
              <button className="btn-save" onClick={handleEdit} disabled={saving}>
                <FontAwesomeIcon icon={faSave} /> {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteEmail && (
        <div className="modal-overlay" onClick={() => setDeleteEmail(null)}>
          <div className="modal-card modal-card--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FontAwesomeIcon icon={faTrash} /> Confirmar eliminación</h2>
              <button className="modal-close" onClick={() => setDeleteEmail(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <p className="delete-confirm-text">
              ¿Eliminar el usuario <strong>{deleteEmail}</strong>? Pasará a ser <strong>Operario</strong>.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteEmail(null)}>Cancelar</button>
              <button className="btn-delete-confirm" onClick={handleDelete} disabled={saving}>
                <FontAwesomeIcon icon={faTrash} /> {saving ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface FormProps {
  form: { email: string; role: UserRole; centro: string; canEditStructure: boolean }
  onChange: (f: { email: string; role: UserRole; centro: string; canEditStructure: boolean }) => void
  centers: string[]
  error: string
  emailReadOnly?: boolean
}

function UserForm({ form, onChange, centers, error, emailReadOnly }: FormProps) {
  const caps = ROLE_CAPABILITIES[form.role]
  return (
    <div className="user-form">
      <div className="form-field">
        <label className="field-label">Email</label>
        <input
          type="email"
          className={`control${error && !form.email ? ' error' : ''}`}
          placeholder="usuario@empresa.com"
          value={form.email}
          readOnly={emailReadOnly}
          onChange={e => onChange({ ...form, email: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="field-label">Rol</label>
        <select
          className="control"
          value={form.role}
          onChange={e => onChange({ ...form, role: e.target.value as UserRole, centro: '', canEditStructure: false })}
        >
          <option value="admin">Admin</option>
          <option value="gestor">Gestor</option>
          <option value="operario">Operario</option>
        </select>
      </div>

      <div className="role-capabilities">
        <div className="role-caps-title">
          <FontAwesomeIcon icon={ROLE_ICONS[form.role]} /> Permisos del rol
        </div>
        <ul className="role-caps-list">
          {caps.map(c => <li key={c}>{c}</li>)}
        </ul>
      </div>

      {form.role === 'gestor' && (
        <div className="form-field">
          <label className="field-label">Centro asignado</label>
          <select
            className={`control${error && !form.centro ? ' error' : ''}`}
            value={form.centro}
            onChange={e => onChange({ ...form, centro: e.target.value })}
          >
            <option value="">Seleccionar centro…</option>
            {centers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <label className="canedit-toggle">
        <input
          type="checkbox"
          checked={form.canEditStructure}
          onChange={e => onChange({ ...form, canEditStructure: e.target.checked })}
        />
        <span className="canedit-toggle-label">
          <FontAwesomeIcon icon={faPencilRuler} /> Permitir editar estructura del formulario
        </span>
      </label>

      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
