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
  images: File[] = [],
): Promise<void> {
  const to = mailRouting[centro] ?? ''
  if (!to) throw new Error(`No hay destinatario configurado para el centro: ${centro}`)

  const pdfBase64 = await blobToBase64(pdfBlob)

  const imageAttachments = await Promise.all(
    images.map(async (img) => ({
      nombre:   img.name,
      mimeType: img.type || 'image/jpeg',
      datos:    await blobToBase64(img),
    }))
  )

  const adjuntos = [
    { nombre: fileName, mimeType: 'application/pdf', datos: pdfBase64 },
    ...imageAttachments,
  ]

  const response = await fetch(GAS_URL, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      token:   'MiClaveSuperSecreta123',
      email:   to,
      replyTo: senderEmail,
      asunto:  `[GRUPO HD] Reporte Operativo: ${centro} - ${fecha} (${turno})`,
      mensaje: `El operario ${responsable} ha cerrado su turno (${fecha} – ${turno}).\n\nSe adjunta el informe operativo${images.length > 0 ? ` y ${images.length} imagen${images.length > 1 ? 'es' : ''} adicional${images.length > 1 ? 'es' : ''}` : ''}.`,
      adjuntos,
    }),
  })

  if (!response.ok) {
    throw new Error(`Error de red al conectar con el servidor (Status: ${response.status})`)
  }

  const resultado = await response.json()

  if (!resultado.success) {
    throw new Error(resultado.error || 'Error desconocido en el servidor de Google')
  }
}
