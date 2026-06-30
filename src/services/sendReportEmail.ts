const GAS_URL = 'https://script.google.com/macros/s/AKfycbxBv4ci7PkyvAvoDoeBgBYPdj_DfIvLZ0hNiejImB_n1GZDZ8MH3rVI4Bca4MV3EK3s/exec'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function sendReportEmail(
  centro: string,
  fecha: string,
  turno: string,
  responsable: string,
  pdfBlob: Blob,
  fileName: string,
  mailRouting: Record<string, string>,
  senderEmail: string,
): Promise<void> {
  const to = mailRouting[centro] ?? ''
  if (!to) throw new Error(`No hay destinatario configurado para el centro: ${centro}`)

  const archivoBase64 = await blobToBase64(pdfBlob)

  // 1. Realizamos el fetch con modo 'cors'
  const response = await fetch(GAS_URL, {
    method: 'POST',
    mode: 'cors', // <--- Cambiado a 'cors' para poder leer la respuesta
    headers: {
      // Usar 'text/plain' es el truco maestro: evita el preflight OPTIONS 
      // que Google Apps Script no sabe responder, pero el script seguirá 
      // recibiendo el JSON perfectamente en e.postData.contents.
      'Content-Type': 'text/plain;charset=utf-8', 
    },
    body: JSON.stringify({
      // token: "MiClaveSuperSecreta123", // <-- Añade esto si usas la seguridad que vimos antes
      email:         to,
      replyTo:       senderEmail,
      asunto:        `[GRUPO HD] Reporte Operativo: ${centro} - ${fecha} (${turno})`,
      mensaje:       `El operario ${responsable} ha cerrado su turno (${fecha} – ${turno}).\n\nSe adjunta el informe operativo.`,
      nombreArchivo: fileName,
      mimeType:      'application/pdf',
      archivoBase64,
      token: "MiClaveSuperSecreta123",
    }),
  })

  // 2. Validar si la petición HTTP falló (ej. error 404 o 500)
  if (!response.ok) {
    throw new Error(`Error de red al conectar con el servidor (Status: ${response.status})`)
  }

  // 3. Leer la respuesta real del Google Apps Script
  const resultado = await response.json()

  // 4. Si el script devolvió { success: false, error: "..." }, lanzamos el error
  if (!resultado.success) {
    throw new Error(resultado.error || 'Error desconocido en el servidor de Google')
  }
}