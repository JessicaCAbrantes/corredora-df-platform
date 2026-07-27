"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../../../../packages/ui/src/components/Button";
import { createHttpLogout } from "../services/http-logout";

const LOGOUT_REDIRECT = "/";

/**
 * Minimal logout control — POST /auth/logout with credentials: include.
 * Does not read cookies or store tokens.
 */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logout] = useState(() => createHttpLogout());

  async function onClick() {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await logout();
      if (!result.ok) {
        setError("Não foi possível sair. Tente novamente.");
        return;
      }

      router.replace(LOGOUT_REDIRECT);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-logout">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        loading={loading}
        onClick={onClick}
        className="auth-logout__button"
      >
        {loading ? "Saindo…" : "Sair"}
      </Button>
      {error ? (
        <p className="auth-logout__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
