/**
 * Auth Boundary stub — access gate only, not domain rules.
 *
 * Control via query:
 * - `?auth=anon` → null (anonymous)
 * - `?auth=1` or omitted → mock user (easier success path)
 */

export type MockSession = { userId: string };

export async function getMockSession(): Promise<MockSession | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const auth = new URLSearchParams(window.location.search).get("auth");

  if (auth === "anon" || auth === "0") {
    return null;
  }

  return { userId: "user_mock_01" };
}
