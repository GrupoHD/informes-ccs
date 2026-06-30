import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { ChecklistItem, ReportHeader } from '../types/report'

interface Payload {
  header:    ReportHeader
  security:  ChecklistItem[]
  cleaning:  ChecklistItem[]
  rounds:    ChecklistItem[]
  submittedBy: string
  submittedAt: string
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[tag] ?? tag))
}

function statusColor(v: string): string {
  if (v === 'OK')  return '#059669'
  if (v === 'NOK') return '#dc2626'
  return '#6b7280'
}

function buildHtml(p: Payload): string {
  const H = p.header
  const allItems = [...p.security, ...p.cleaning, ...p.rounds]

  const rows = allItems.map(it => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#1f2937;">${escapeHtml(it.label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:bold;text-align:center;color:${statusColor(it.status)};">${escapeHtml(it.status || '-')}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#dc2626;">${escapeHtml(it.detail || '')}</td>
    </tr>`).join('')

  const obs = H.obs
    ? escapeHtml(H.obs).replace(/\n/g, '<br>')
    : '<span style="color:#9ca3af;font-style:italic;">Sin novedades extraordinarias reportadas.</span>'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
  *{box-sizing:border-box;}
  body{font-family:Arial,sans-serif;margin:0;padding:0;color:#1f2937;background:#fff;width:830px;}
  .page{padding:50px 60px;}
  .header{border-bottom:3px solid #4f6359;padding-bottom:15px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:flex-end;}
  .logo-hd{font-size:38px;font-weight:900;color:#ceab69;margin:0;line-height:.8;letter-spacing:-1px;}
  .logo-g{font-size:10px;font-weight:bold;color:#ceab69;letter-spacing:5px;margin:4px 0 0 2px;}
  .sub{font-size:10px;color:#6b7280;text-transform:uppercase;margin:12px 0 0 0;letter-spacing:2px;}
  .title{font-size:18px;font-weight:bold;color:#4f6359;text-transform:uppercase;}
  .grid{width:100%;border-collapse:collapse;margin-bottom:30px;}
  .grid td{width:33.3%;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;}
  .g-lbl{font-size:9px;color:#6b7280;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:4px;}
  .g-val{font-size:14px;font-weight:bold;margin:0;color:#111827;}
  .sec-title{font-size:13px;font-weight:bold;color:#111827;text-transform:uppercase;margin-bottom:10px;border-left:4px solid #ceab69;padding-left:8px;}
  .table{width:100%;border-collapse:collapse;margin-bottom:30px;}
  .table th{background:#4f6359;color:white;text-align:left;padding:10px 12px;font-size:10px;text-transform:uppercase;}
  .obs{padding:15px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;line-height:1.6;min-height:60px;background:#fff;margin-bottom:40px;}
  .sig-box{width:100%;text-align:center;margin-top:50px;}
  .sig-font{font-family:'Caveat',cursive;font-size:36px;font-style:italic;color:#4f6359;margin:0;}
  .sig-line{border-top:1px solid #4f6359;width:250px;margin:5px auto 0;padding-top:5px;font-size:10px;color:#6b7280;text-transform:uppercase;}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <p class="logo-hd">HD</p>
      <p class="logo-g">GRUPO</p>
      <p class="sub">Centro: ${escapeHtml(H.centro)}</p>
    </div>
    <div><p class="title">Informe de Turno</p></div>
  </div>

  <table class="grid">
    <tr>
      <td><span class="g-lbl">Fecha Registrada</span><p class="g-val">${escapeHtml(H.fecha)}</p></td>
      <td><span class="g-lbl">Turno Asignado</span><p class="g-val">${escapeHtml(H.turno)}</p></td>
      <td><span class="g-lbl">Operario Autorizado</span><p class="g-val">${escapeHtml(H.responsable)}</p></td>
    </tr>
  </table>

  <div class="sec-title">Auditoría de Protocolos</div>
  <table class="table">
    <thead>
      <tr>
        <th style="width:50%">Parámetro de Control</th>
        <th style="width:15%;text-align:center">Estado</th>
        <th style="width:35%">Justificación (NOK)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="sec-title">Novedades Extraordinarias</div>
  <div class="obs">${obs}</div>

  <div class="sig-box">
    <p class="sig-font">${escapeHtml(H.firma)}</p>
    <div class="sig-line">Firma Digital del Operario</div>
  </div>
</div>
</body>
</html>`
}

export async function generateReportPdf(payload: Payload): Promise<Blob> {
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;top:0;'
  container.innerHTML = buildHtml(payload)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 830,
      windowWidth: 830,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf    = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW  = pdf.internal.pageSize.getWidth()   // 595pt
    const pageH  = pdf.internal.pageSize.getHeight()  // 842pt
    const ratio  = pageW / canvas.width
    const imgH   = canvas.height * ratio

    let yPos = 0
    while (yPos < imgH) {
      if (yPos > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, -yPos, pageW, imgH)
      yPos += pageH
    }

    return pdf.output('blob')
  } finally {
    document.body.removeChild(container)
  }
}
