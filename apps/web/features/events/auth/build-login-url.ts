/**
 * Auth Boundary navigation — preserves returnUrl for post-login resume.
 */
export function buildLoginUrl(returnUrl: string): string {
  const params = new URLSearchParams({ returnUrl });
  return `/auth/login?${params.toString()}`;
}
