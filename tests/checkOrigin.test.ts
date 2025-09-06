import { describe, it, expect } from 'vitest'
import { checkOrigin } from '../src/lib/utils'

function reqWith(header: string | undefined, headerName: 'origin' | 'referer' = 'origin') {
  return new Request('http://server.local', {
    headers: header ? { [headerName]: header } as Record<string, string> : undefined,
  })
}

describe('checkOrigin', () => {
  const allowed = ['https://trusted.com', 'http://localhost:3000']

  it('allows exact origin matches only', () => {
    expect(checkOrigin(reqWith('https://trusted.com'), allowed)).toBe(true)
    expect(checkOrigin(reqWith('https://trusted.com.evil'), allowed)).toBe(false)
    expect(checkOrigin(reqWith('https://eviltrusted.com'), allowed)).toBe(false)
  })

  it('parses referer and compares origin', () => {
    expect(checkOrigin(reqWith('https://trusted.com/path?q=1', 'referer'), allowed)).toBe(true)
  })

  it('rejects malformed origins', () => {
    // Malformed value should not crash and should be rejected
    expect(checkOrigin(reqWith('not a url'), allowed)).toBe(false)
  })

  it('allows when no header or no allowed list is provided', () => {
    expect(checkOrigin(reqWith(undefined), allowed)).toBe(true)
    expect(checkOrigin(reqWith('https://anything.com'), [])).toBe(true)
  })
})

