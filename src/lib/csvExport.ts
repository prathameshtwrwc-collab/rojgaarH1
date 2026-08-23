function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str: string;
  if (Array.isArray(value)) str = value.join('; ');
  else if (typeof value === 'boolean') str = value ? 'Yes' : 'No';
  else str = String(value);

  if (/[",\n]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports an array of flat objects to a CSV file and triggers a browser download.
 * Column headers are derived from the union of all keys across all rows, in
 * first-seen order, so every field present anywhere in the dataset is included.
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
  if (rows.length === 0) return;

  const headers: string[] = [];
  const seen = new Set<string>();
  rows.forEach(row => {
    Object.keys(row).forEach(key => {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    });
  });

  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escapeCsvValue(row[h])).join(',')),
  ];

  const csv = '﻿' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
