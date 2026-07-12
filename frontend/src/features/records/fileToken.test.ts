import { describe, it, expect } from 'vitest'
import { msUntilExpiry } from './fileToken'

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.fakesig`
}

describe('msUntilExpiry', () => {
  it('returns the milliseconds remaining until the exp claim', () => {
    const now = 1_700_000_000_000
    const token = makeJwt({ exp: now / 1000 + 120 })
    expect(msUntilExpiry(token, now)).toBe(120_000)
  })

  it('returns 0 for an already expired token', () => {
    const now = 1_700_000_000_000
    const token = makeJwt({ exp: now / 1000 - 10 })
    expect(msUntilExpiry(token, now)).toBe(0)
  })

  it('returns 0 for a token without exp claim', () => {
    const token = makeJwt({ type: 'file' })
    expect(msUntilExpiry(token, Date.now())).toBe(0)
  })

  it('returns 0 for a malformed token', () => {
    expect(msUntilExpiry('not-a-jwt', Date.now())).toBe(0)
    expect(msUntilExpiry('', Date.now())).toBe(0)
  })
})
