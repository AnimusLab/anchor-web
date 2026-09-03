/**
 * Anchor Sovereign Authentication Rate Limiter
 * Defense-in-depth rate limiting & brute-force lockout protection.
 * Tracks failed login attempts per Client IP and per Target Identity.
 */

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// In-memory sliding window store
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (record.lockedUntil && record.lockedUntil > now) return;
      // Purge entries older than 30 minutes
      if (now - record.lastAttempt > 30 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    });
  }, 10 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  totalAttempts: number;
  retryAfterSeconds?: number;
  lockedUntilIso?: string;
  message?: string;
}

/**
 * Extracts client IP from standard proxy & reverse-proxy headers (Nginx, Cloudflare, AWS ALB)
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Return first client IP in comma-separated proxy list
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Checks if a given key (IP address or email identifier) is currently rate limited / locked out.
 * 
 * Default Rules:
 * - Max 5 failed attempts within 15 minutes (900,000 ms)
 * - Exceeding 5 attempts locks the identifier for 15 minutes (900 seconds)
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  lockoutMs = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    return {
      allowed: true,
      remaining: maxAttempts,
      totalAttempts: 0,
    };
  }

  // Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      totalAttempts: record.count,
      retryAfterSeconds,
      lockedUntilIso: new Date(record.lockedUntil).toISOString(),
      message: `🚫 Security Lockout: Too many failed attempts. Account temporarily locked for ${Math.ceil(retryAfterSeconds / 60)} more minutes.`,
    };
  }

  // Reset window if elapsed
  if (now - record.firstAttempt > windowMs) {
    rateLimitStore.delete(key);
    return {
      allowed: true,
      remaining: maxAttempts,
      totalAttempts: 0,
    };
  }

  // Check if limit exceeded
  if (record.count >= maxAttempts) {
    // Trigger lockout
    record.lockedUntil = now + lockoutMs;
    const retryAfterSeconds = Math.ceil(lockoutMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      totalAttempts: record.count,
      retryAfterSeconds,
      lockedUntilIso: new Date(record.lockedUntil).toISOString(),
      message: `🚫 Security Lockout: Exceeded ${maxAttempts} failed login attempts. Locked for 15 minutes.`,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - record.count),
    totalAttempts: record.count,
  };
}

/**
 * Records a failed attempt for a given key (IP address or email identifier).
 */
export function recordFailedAttempt(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  lockoutMs = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record || now - record.firstAttempt > windowMs) {
    record = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
  } else {
    record.count += 1;
    record.lastAttempt = now;
  }

  if (record.count >= maxAttempts) {
    record.lockedUntil = now + lockoutMs;
  }

  rateLimitStore.set(key, record);

  const remaining = Math.max(0, maxAttempts - record.count);
  const isLocked = !!record.lockedUntil && record.lockedUntil > now;
  const retryAfterSeconds = isLocked ? Math.ceil((record.lockedUntil! - now) / 1000) : undefined;

  return {
    allowed: !isLocked,
    remaining,
    totalAttempts: record.count,
    retryAfterSeconds,
    lockedUntilIso: record.lockedUntil ? new Date(record.lockedUntil).toISOString() : undefined,
    message: isLocked
      ? `🚫 Security Lockout: Exceeded ${maxAttempts} failed attempts. Locked for 15 minutes.`
      : `⚠️ Warning: ${remaining} attempt(s) remaining before temporary lockout.`,
  };
}

/**
 * Clears rate limit state on successful authentication.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// -----------------------------------------------------------------------------
// TOTP SINGLE-USE CONSUMPTION (PREVENT REPLAY ATTACKS WITHIN 30S EPOCH)
// -----------------------------------------------------------------------------
const usedTotpTokens = new Map<string, number>();

/**
 * Checks if a TOTP code was already consumed for this identity.
 * If not consumed, records it with a 90-second TTL.
 * Returns true if valid & newly consumed, false if already consumed (replayed).
 */
export function consumeTotpToken(identityKey: string, totpCode: string): boolean {
  const tokenKey = `${identityKey}:${totpCode.trim()}`;
  const now = Date.now();
  const consumedAt = usedTotpTokens.get(tokenKey);

  // If already consumed within the last 90 seconds, reject as replay
  if (consumedAt && now - consumedAt < 90 * 1000) {
    return false;
  }

  // Record consumption
  usedTotpTokens.set(tokenKey, now);

  // Self-cleaning after 90s
  setTimeout(() => {
    usedTotpTokens.delete(tokenKey);
  }, 95 * 1000);

  return true;
}

// -----------------------------------------------------------------------------
// JWT JTI REVOCATION BLOCKLIST (INSTANT SERVER-SIDE LOGOUT)
// -----------------------------------------------------------------------------
const revokedJtiStore = new Map<string, number>();

/**
 * Marks a JWT ID (JTI) as revoked until its natural expiry time.
 */
export function revokeJwt(jti: string, expiresAtMs: number): void {
  revokedJtiStore.set(jti, expiresAtMs);
}

/**
 * Checks if a JWT ID (JTI) has been revoked on the server side.
 */
export function isJwtRevoked(jti: string): boolean {
  const now = Date.now();
  const expiresAt = revokedJtiStore.get(jti);
  if (!expiresAt) return false;
  if (now > expiresAt) {
    revokedJtiStore.delete(jti);
    return false;
  }
  return true;
}
