export function emailHtml(centro: string, responsable: string, fecha: string, turno: string): string {
  return `
<div style="font-family:'Inter',Helvetica,sans-serif;padding:30px;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#4f6359;border-bottom:4px solid #ceab69;padding:25px;text-align:center;">
      <h2 style="color:#ceab69;margin:0;font-size:28px;font-weight:900;letter-spacing:2px;font-family:Arial,sans-serif;">
        HD<span style="font-size:14px;display:block;letter-spacing:6px;">GRUPO</span>
      </h2>
      <p style="color:#ffffff;margin:15px 0 0 0;font-size:12px;text-transform:uppercase;font-weight:bold;">
        División Operaciones · ${centro}
      </p>
    </div>
    <div style="padding:30px;">
      <h3 style="margin-top:0;color:#1f2937;">Reporte Auditado</h3>
      <p style="color:#4b5563;line-height:1.6;">
        El operario <strong>${responsable}</strong> ha procedido al cierre de su turno
        (${fecha} – ${turno}). Se adjunta el informe operativo detallado para su revisión.
      </p>
      <div style="background:#f1f5f9;padding:15px;border:1px solid #e2e8f0;border-radius:6px;margin-top:20px;">
        <p style="margin:0;font-size:13px;color:#6b7280;">
          📄 El informe operativo se adjunta en formato PDF a este correo.
        </p>
      </div>
    </div>
  </div>
</div>`
}
