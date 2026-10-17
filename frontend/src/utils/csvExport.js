function safeCell(value) {
  let text = String(value ?? '');
  // Evita que planilhas executem conteúdo vindo de campos iniciados por operadores de fórmula.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCsv(rows, filename) {
  if (!rows.length) return false;
  const columns = Object.keys(rows[0]);
  const header = columns.map(safeCell).join(';');
  const lines = rows.map(row => columns
    .map(column => safeCell(Array.isArray(row[column]) ? row[column].join(', ') : row[column]))
    .join(';'));
  const csv = [header, ...lines].join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
