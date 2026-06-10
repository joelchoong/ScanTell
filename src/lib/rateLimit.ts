// Simple in-memory rate limiter
// Note: For production with multiple server instances, use Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export async function rateLimit({
  identifier,
  limit = 10,
  window = 60 * 1000, // 1 minute in milliseconds
}: {
  identifier: string;
  limit?: number;
  window?: number;
}): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(identifier);
  }

  const currentEntry = rateLimitMap.get(identifier);

  if (!currentEntry) {
    // First request in window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + window,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + window,
    };
  }

  if (currentEntry.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    };
  }

  // Increment count
  currentEntry.count += 1;
  rateLimitMap.set(identifier, currentEntry);

  return {
    success: true,
    remaining: limit - currentEntry.count,
    resetTime: currentEntry.resetTime,
  };
}

// Helper to get client IP from request
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}
