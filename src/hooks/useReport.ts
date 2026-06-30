import { useState, useRef, useCallback } from 'react'
import type { User } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { sendReportEmail } from '../services/sendReportEmail'
import { SECURITY_ITEMS, CLEANING_ITEMS, ROUNDS } from '../config/checklistData'
import { useConfig } from '../context/ConfigContext'
import type { ChecklistItem, ReportHeader, StatusValue } from '../types/report'
import { generateReportPdf } from '../utils/generatePdf'

function todayISO(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function initItems(defs: { label: string; icon: string }[]): ChecklistItem[] {
  return defs.map(d => ({ label: d.label, icon: d.icon, status: '' as StatusValue, detail: '' }))
}

function initRounds(): ChecklistItem[] {
  return ROUNDS.map(h => ({ label: h, icon: 'faClock', status: '' as StatusValue, detail: '' }))
}

export function useReport(user: User) {
  const config = useConfig()

  function getCenterFromEmail(email: string): string | null {
    const lower = email.toLowerCase()
    if (config.admins.has(lower)) return null
    const gestorCenter = config.gestors[lower]
    if (gestorCenter) return gestorCenter
    const domain = lower.split('@')[1]
    const domainMap: Record<string, string> = Object.fromEntries(
      Object.entries(config.gestors).map(([email, center]) => [email.split('@')[1], center])
    )
    return domainMap[domain] ?? null
  }

  const lockedCenter = getCenterFromEmail(user.email ?? '')

  const [header, setHeader] = useState<ReportHeader>({
    centro:      lockedCenter ?? '',
    fecha:       todayISO(),
    turno:       '',
    responsable: '',
    obs:         '',
    firma:       '',
  })

  const [security, setSecurity] = useState<ChecklistItem[]>(initItems(SECURITY_ITEMS))
  const [cleaning, setCleaning] = useState<ChecklistItem[]>(initItems(CLEANING_ITEMS))
  const [rounds,   setRounds]   = useState<ChecklistItem[]>(initRounds())

  const [attachedImages, setAttachedImages] = useState<File[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal]       = useState(false)
  const [submitError, setSubmitError]   = useState('')

  const firstErrorRef = useRef<HTMLElement | null>(null)

  function updateHeader(field: keyof ReportHeader, value: string) {
    setHeader(h => ({ ...h, [field]: value }))
  }

  function updateItem(
    type: 'security' | 'cleaning' | 'rounds',
    index: number,
    status: StatusValue,
    detail: string,
  ) {
    const setter = type === 'security' ? setSecurity : type === 'cleaning' ? setCleaning : setRounds
    setter(prev => prev.map((it, i) => i === index ? { ...it, status, detail } : it))
  }

  // ── Edición de estructura (solo admin/gestor) ─────────────────────────────

  function addItem(type: 'security' | 'cleaning', label: string) {
    const newItem: ChecklistItem = { label, icon: 'faPlus', status: '', detail: '' }
    if (type === 'security') setSecurity(prev => [...prev, newItem])
    else setCleaning(prev => [...prev, newItem])
  }

  function removeItem(type: 'security' | 'cleaning', index: number) {
    const setter = type === 'security' ? setSecurity : setCleaning
    setter(prev => prev.filter((_, i) => i !== index))
  }

  function renameItem(type: 'security' | 'cleaning', index: number, label: string) {
    const setter = type === 'security' ? setSecurity : setCleaning
    setter(prev => prev.map((it, i) => i === index ? { ...it, label } : it))
  }

  function addRound(hour: string) {
    const trimmed = hour.trim()
    if (!trimmed) return
    setRounds(prev => [...prev, { label: trimmed, icon: 'faClock', status: '', detail: '' }])
  }

  function removeRound(index: number) {
    setRounds(prev => prev.filter((_, i) => i !== index))
  }

  // ─────────────────────────────────────────────────────────────────────────

  function validate(): boolean {
    firstErrorRef.current = null
    let valid = true

    const requiredFields: Array<{ value: string; id: string }> = [
      { value: header.centro,      id: 'f-centro' },
      { value: header.fecha,       id: 'f-fecha' },
      { value: header.turno,       id: 'f-turno' },
      { value: header.responsable, id: 'f-responsable' },
      { value: header.firma,       id: 'f-firma' },
    ]

    for (const f of requiredFields) {
      if (!f.value.trim()) {
        valid = false
        const el = document.getElementById(f.id)
        if (el) {
          el.classList.add('error')
          if (!firstErrorRef.current) firstErrorRef.current = el as HTMLElement
        }
      }
    }

    const allItems = [...security, ...cleaning, ...rounds]
    allItems.forEach((it, idx) => {
      if (it.status === '') {
        valid = false
        const el = document.getElementById(`status-${idx}`)
        if (el) {
          el.classList.add('error')
          if (!firstErrorRef.current) firstErrorRef.current = el as HTMLElement
        }
      }
    })

    if (!valid && firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return valid
  }

  const submitReport = useCallback(async () => {
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const payload = { header, security, cleaning, rounds, submittedBy: user.email ?? '', submittedAt: new Date().toISOString() }

      const pdfBlob = await generateReportPdf(payload)
      const fileName = `Parte_${header.centro}_${header.fecha}_${header.turno}.pdf`

      await addDoc(collection(db, 'reports'), payload)

      await sendReportEmail(header.centro, header.fecha, header.turno, header.responsable, pdfBlob, fileName, config.mailRouting, user.email ?? '', attachedImages)

      setShowModal(true)
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }, [header, security, cleaning, rounds, user])

  function resetForm() {
    setHeader({
      centro:      lockedCenter ?? '',
      fecha:       todayISO(),
      turno:       '',
      responsable: '',
      obs:         '',
      firma:       '',
    })
    setSecurity(initItems(SECURITY_ITEMS))
    setCleaning(initItems(CLEANING_ITEMS))
    setRounds(initRounds())
    setAttachedImages([])
    setShowModal(false)
    setSubmitError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    header, updateHeader, lockedCenter,
    security, cleaning, rounds, updateItem,
    addItem, removeItem, renameItem,
    addRound, removeRound,
    attachedImages, setAttachedImages,
    isSubmitting, showModal, submitError,
    submitReport, resetForm,
  }
}
