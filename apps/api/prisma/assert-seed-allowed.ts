/**
 * Fail-closed guard for Prisma seed (FASE 3.3-C).
 * Production requires an explicit ALLOW_DB_SEED=true override.
 */
export function assertSeedAllowed(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (env.NODE_ENV === "production" && env.ALLOW_DB_SEED !== "true") {
    throw new Error(
      [
        "Database seed is disabled in production.",
        "",
        "If you really need to execute it, set:",
        "",
        "  ALLOW_DB_SEED=true",
        "",
        "and rerun the command.",
        "",
        "This operation may overwrite development fixtures.",
      ].join("\n"),
    );
  }
}
