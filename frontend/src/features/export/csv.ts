/** RFC 4180 CSV: quote cells containing commas, quotes or line breaks. */
export function toCsv<T extends object>(rows: T[], columns: Array<keyof T & string>): string {
  const escape = (value: unknown): string => {
    const s = value == null ? '' : String(value)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    columns.join(','),
    ...rows.map((row) => columns.map((col) => escape(row[col])).join(',')),
  ]
  return lines.join('\r\n') + '\r\n'
}
