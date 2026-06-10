// Simple in-memory cache for user session data
// Cache user data for 5 minutes to reduce database queries

interface CacheEntry {
  data: { name: string | null; email: string };
  expiry: number;
}

const sessionCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getUserFromCache(userId: string): { name: string | null; email: string } | null {
  const entry = sessionCache.get(userId);
  
  if (!entry) {
    return null;
  }
  
  // Check if cache entry has expired
  if (Date.now() > entry.expiry) {
    sessionCache.delete(userId);
    return null;
  }
  
  return entry.data;
}

export function setUserInCache(userId: string, data: { name: string | null; email: string }): void {
  sessionCache.set(userId, {
    data,
    expiry: Date.now() + CACHE_TTL,
  });
}

export function invalidateUserCache(userId: string): void {
  sessionCache.delete(userId);
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of sessionCache.entries()) {
    if (now > entry.expiry) {
      sessionCache.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute
