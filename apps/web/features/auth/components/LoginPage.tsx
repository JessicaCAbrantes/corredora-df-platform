"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "../../../../../packages/ui/src/components/Button";
import {
  createHttpLogin,
  type LoginError,
} from "../services/http-login";
import { resolveSafeReturnUrl } from "../utils/safe-return-url";

export type LoginPageProps = {
  returnUrl?: string | null;
};

function messageForError(error: LoginError): string {
  switch (error) {
    case "INVALID_CREDENTIALS":
      return "E-mail ou senha inválidos.";
    case "VALIDATION_ERROR":
      return "Verifique os dados informados.";
    case "NETWORK":
      return "Não foi possível conectar. Tente novamente.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}

/**
 * Minimal login form — posts to Auth MVP; cookie stays HttpOnly in the browser.
 */
export function LoginPage({ returnUrl }: LoginPageProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [login] = useState(() => createHttpLogin());

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await login({ email, password });
      if (!result.ok) {
        setError(messageForError(result.error));
        return;
      }

      const target = resolveSafeReturnUrl(returnUrl);
      router.replace(target);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-login">
      <div className="auth-login__panel">
        <p className="auth-login__brand">Corredora DF</p>
        <h1 className="auth-login__title">Entrar</h1>
        <p className="auth-login__subtitle">
          Use sua conta para continuar a inscrição.
        </p>

        <form className="auth-login__form" onSubmit={onSubmit} noValidate>
          <label className="auth-login__field">
            <span className="auth-login__label">E-mail</span>
            <input
              className="auth-login__input"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-login__field">
            <span className="auth-login__label">Senha</span>
            <input
              className="auth-login__input"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? (
            <p className="auth-login__error" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            loading={loading}
            className="auth-login__submit"
          >
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
