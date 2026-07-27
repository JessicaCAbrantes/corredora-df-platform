export type Env = {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  AUTH_SECRET: string;
};

function requireString(value: unknown, key: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or invalid environment variable: ${key}`);
  }
  return value;
}

/**
 * Minimal env validation for Backend Foundation + Auth MVP.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const portRaw = config.PORT ?? "3001";
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return {
    PORT: port,
    NODE_ENV: requireString(config.NODE_ENV ?? "development", "NODE_ENV"),
    DATABASE_URL: requireString(config.DATABASE_URL, "DATABASE_URL"),
    CORS_ORIGIN: requireString(
      config.CORS_ORIGIN ?? "http://localhost:3000",
      "CORS_ORIGIN",
    ),
    AUTH_SECRET: requireString(config.AUTH_SECRET, "AUTH_SECRET"),
  };
}
