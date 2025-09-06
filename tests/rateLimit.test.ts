import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimit } from '@/lib/utils'

function reqWithIP(ip: string) {
  return new Request('http://test.local', {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(0))
  })

  it('allows up to the limit within the window and blocks the next', () => {
    const limit = 3
    const windowMs = 1_000
    const req = reqWithIP('1.2.3.4')

    expect(rateLimit(req, limit, windowMs)).toBe(true)
    expect(rateLimit(req, limit, windowMs)).toBe(true)
    expect(rateLimit(req, limit, windowMs)).toBe(true)
    // Next call exceeds limit
    expect(rateLimit(req, limit, windowMs)).toBe(false)
  })

  it('resets after the time window elapses', () => {
    const limit = 2
    const windowMs = 1_000
    const req = reqWithIP('5.6.7.8')

    expect(rateLimit(req, limit, windowMs)).toBe(true)
    expect(rateLimit(req, limit, windowMs)).toBe(true)
    // Block within the same window
    expect(rateLimit(req, limit, windowMs)).toBe(false)

    // Advance time beyond the window; should reset
    vi.setSystemTime(new Date(windowMs + 1))
    expect(rateLimit(req, limit, windowMs)).toBe(true)
  })
})

