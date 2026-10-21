/** Exportación sin dependencias externas: PDF mediante diálogo de impresión y Excel como CSV UTF-8. */
export function exportarExcel(nombre: string, cabeceras: string[], filas: (string | number | null | undefined)[][]): void {
  const celda = (dato: string | number | null | undefined): string => {
    const texto = String(dato ?? '');
    // Impide interpretación de fórmulas en Excel para datos ingresados por usuarios.
    const seguro = /^[\s]*[=+@-]/.test(texto) && typeof dato !== 'number' ? "'" + texto : texto;
    return '"' + seguro.replace(/"/g, '""') + '"';
  };
  const csv = '\uFEFF' + [cabeceras, ...filas].map(fila => fila.map(celda).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const enlace = document.createElement('a'); enlace.href = url; enlace.download = nombre + '.csv'; enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportarPdf(titulo: string, cabeceras: string[], filas: (string | number | null | undefined)[][]): void {
  const escapeHtml = (dato: unknown): string => String(dato ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] ?? c));
  const ventana = window.open('', '_blank');
  if (!ventana) { window.alert('Permite las ventanas emergentes para exportar el PDF.'); return; }
  ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(titulo)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#222}h1{font-size:21px}p{color:#555;font-size:12px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{text-align:left;padding:7px;border:1px solid #ddd}th{background:#eee}@page{size:landscape;margin:14mm}</style></head><body><h1>${escapeHtml(titulo)}</h1><p>RollerApp · Emitido: ${escapeHtml(new Date().toLocaleString('es-CL'))}</p><table><thead><tr>${cabeceras.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${filas.map(f => `<tr>${f.map(v => `<td>${escapeHtml(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`);
  ventana.document.close();
  ventana.addEventListener('load', () => { ventana.focus(); ventana.print(); }, {once:true});
}
