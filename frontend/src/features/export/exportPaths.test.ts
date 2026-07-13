import { describe, it, expect } from 'vitest'
import { recordFolderNames } from './exportPaths'

const rec = (id: string, date: string, title: string) => ({ id, date, title })

describe('recordFolderNames', () => {
  it('prefixes the date and keeps a clean title', () => {
    const map = recordFolderNames([rec('r1', '2026-07-20 10:30:00.000Z', 'Visita cardiologica')])
    expect(map.get('r1')).toBe('2026-07-20 Visita cardiologica')
  })

  it('replaces filesystem-hostile characters with underscores', () => {
    const map = recordFolderNames([rec('r1', '2026-07-20 10:30:00.000Z', 'Esami: TAC/RMN "urgente"?')])
    expect(map.get('r1')).toBe('2026-07-20 Esami_ TAC_RMN _urgente__')
  })

  it('truncates titles longer than 80 characters', () => {
    const map = recordFolderNames([rec('r1', '2026-07-20 10:30:00.000Z', 'x'.repeat(120))])
    expect(map.get('r1')).toBe(`2026-07-20 ${'x'.repeat(80)}`)
  })

  it('suffixes the record id on date+title collisions', () => {
    const map = recordFolderNames([
      rec('aaa', '2026-07-20 10:30:00.000Z', 'Visita'),
      rec('bbb', '2026-07-20 18:00:00.000Z', 'Visita'),
    ])
    expect(map.get('aaa')).toBe('2026-07-20 Visita')
    expect(map.get('bbb')).toBe('2026-07-20 Visita bbb')
  })
})
