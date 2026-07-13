import { describe, it, expect } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('emits only the header for an empty row set', () => {
    expect(toCsv([], ['a', 'b'])).toBe('a,b\r\n')
  })

  it('emits rows in column order', () => {
    const rows = [{ b: 2, a: 1 }, { a: 3, b: 4 }]
    expect(toCsv(rows, ['a', 'b'])).toBe('a,b\r\n1,2\r\n3,4\r\n')
  })

  it('quotes values containing commas, quotes and newlines', () => {
    const rows = [{ a: 'ciao, mondo', b: 'lei disse "ok"', c: 'riga1\nriga2' }]
    expect(toCsv(rows, ['a', 'b', 'c'])).toBe(
      'a,b,c\r\n"ciao, mondo","lei disse ""ok""","riga1\nriga2"\r\n',
    )
  })

  it('serializes null and undefined as empty cells', () => {
    const rows = [{ a: null, b: undefined, c: 0 }]
    expect(toCsv(rows, ['a', 'b', 'c'])).toBe('a,b,c\r\n,,0\r\n')
  })
})
