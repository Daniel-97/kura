import { describe, it, expect } from 'vitest'
import { buildIcs } from './ics'

const base = {
  id: 'rec123',
  title: 'Visita cardiologica',
  description: '',
  start: new Date('2026-07-20T10:30:00Z'),
  stamp: new Date('2026-07-13T09:00:00Z'),
}

describe('buildIcs', () => {
  it('produces a VCALENDAR with one VEVENT and UTC datetimes', () => {
    const ics = buildIcs(base)
    const lines = ics.split('\r\n')
    expect(lines[0]).toBe('BEGIN:VCALENDAR')
    expect(lines).toContain('BEGIN:VEVENT')
    expect(lines).toContain('UID:rec123@kura')
    expect(lines).toContain('DTSTART:20260720T103000Z')
    expect(lines).toContain('DTEND:20260720T113000Z') // +1h default
    expect(lines).toContain('DTSTAMP:20260713T090000Z')
    expect(lines).toContain('SUMMARY:Visita cardiologica')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).not.toContain('DESCRIPTION')
  })

  it('escapes commas, semicolons, backslashes and newlines in text fields', () => {
    const ics = buildIcs({
      ...base,
      title: 'Esami; TAC, RMN \\ altro',
      description: 'riga1\nriga2',
    })
    expect(ics).toContain('SUMMARY:Esami\\; TAC\\, RMN \\\\ altro')
    expect(ics).toContain('DESCRIPTION:riga1\\nriga2')
  })

  it('folds lines longer than 75 octets with CRLF + space', () => {
    const ics = buildIcs({ ...base, title: 'x'.repeat(120) })
    for (const line of ics.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(75)
    }
    // folded continuation starts with a space and unfolds back to the title
    expect(ics.replace(/\r\n /g, '')).toContain('x'.repeat(120))
  })
})
