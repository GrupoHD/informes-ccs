import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { MAIL_ROUTING, FALLBACK_EMAIL } from './config'
import { emailHtml } from './mailTemplates'

const GOOGLE_SCRIPT_URL = 'https://script.google.com/a/macros/grupohd.com/s/AKfycbxyrYe2kD2LKtYKcLiUJ056jUPKzaWFpJDvWcf9PcZE4BjupNeuzO-MHfBBK_gB_6HQMw/exec'

interface SendReportData {
  centro:       string
  fecha:        string
  turno:        string
  responsable:  string
  nombreArchivo: string
  pdfBase64:    string
}

export const sendReport = onCall(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Autenticación requerida.')
    }

    const { centro, fecha, turno, responsable, nombreArchivo, pdfBase64 } = request.data as SendReportData
    if (!centro || !fecha || !turno || !pdfBase64) {
      throw new HttpsError('invalid-argument', 'Faltan campos requeridos.')
    }

    const target  = MAIL_ROUTING[centro] ?? FALLBACK_EMAIL
    const replyTo = request.auth.token.email ?? ''

    const payload = {
      email:         target,
      replyTo,
      asunto:        `[GRUPO HD] Reporte Operativo: ${centro} - ${fecha} (${turno})`,
      mensaje:       emailHtml(centro, responsable, fecha, turno),
      nombreArchivo,
      mimeType:      'application/pdf',
      archivoBase64: pdfBase64,
    }

    const scriptResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const result = await scriptResponse.json() as { success: boolean; error?: string }
    if (!result.success) {
      throw new HttpsError('internal', `Error en Google Script: ${result.error ?? 'desconocido'}`)
    }

  
    return { ok: true }
  }
)
