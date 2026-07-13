interface IcsEvent {
  id: string
  title: string
  description: string
  start: Date
  /** Event length; medical visits default to one hour. */
  durationMinutes?: number
  /** Generation timestamp, injectable for tests. */
  stamp?: Date
}

const escapeText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

const utcStamp = (d: Date): string =>
  d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** RFC 5545: content lines must not exceed 75 octets; continuation
 *  lines start with a single space. */
const fold = (line: string): string => {
  const chunks: string[] = []
  let rest = line
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 74))
    rest = ' ' + rest.slice(74)
  }
  chunks.push(rest)
  return chunks.join('\r\n')
}

export function buildIcs(event: IcsEvent): string {
  const durationMs = (event.durationMinutes ?? 60) * 60_000
  const end = new Date(event.start.getTime() + durationMs)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kura//Libretto sanitario//IT',
    'BEGIN:VEVENT',
    `UID:${event.id}@kura`,
    `DTSTAMP:${utcStamp(event.stamp ?? new Date())}`,
    `DTSTART:${utcStamp(event.start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escapeText(event.description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
