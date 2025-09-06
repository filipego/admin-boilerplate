export function checkOrigin(req: Request, allowedOrigins: string[] = []): boolean {
  try {
    const headerValue = req.headers.get('origin') || req.headers.get('referer') || '';
    if (!headerValue) return true; // allow same-origin/fetch from server
    if (allowedOrigins.length === 0) return true;

    // Normalize to strict origin (scheme + host + port)
    const toOrigin = (value: string): string => {
      try {
        return new URL(value).origin;
      } catch {
        return value; // fallback to raw string if already origin-like
      }
    };

    const requestOrigin = toOrigin(headerValue);
    const allowed = allowedOrigins.map(toOrigin);
    return allowed.some((o) => o === requestOrigin);
  } catch {
    return false;
  }
}

const ipHits = new Map<string, { count: number; ts: number }>();
export function rateLimit(req: Request, limit = 20, windowMs = 60_000): boolean {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const now = Date.now();
    const entry = ipHits.get(ip);
    if (!entry || now - entry.ts > windowMs) {
      ipHits.set(ip, { count: 1, ts: now });
      return true;
    }
    if (entry.count + 1 > limit) return false;
    entry.count += 1;
    return true;
  } catch {
    return true;
  }
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
