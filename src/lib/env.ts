// Environment variable validation
// This ensures all required environment variables are set at startup

const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
} as const;

const optionalEnvVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  // Google OAuth — optional until the feature is implemented
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
} as const;

function validateEnv() {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
  };
}

// Validate on import - fail fast if env is misconfigured
export const env = validateEnv();

// Type-safe access to environment variables
export type Env = typeof env;
