"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";
import { buildLoginUrl } from "../../events/auth/build-login-url";
import {
  createHttpGetCurrentUser,
  type CurrentUser,
} from "../services/http-get-current-user";

type ProfileLoadState =
  | { status: "loading" }
  | { status: "ready"; user: CurrentUser }
  | { status: "error" };

const PROFILE_RETURN_URL = "/perfil";

/**
 * Profile MVP — read-only identity from GET /auth/me.
 * Anonymous / network failure → login with returnUrl=/perfil.
 */
export function ProfilePage() {
  const router = useRouter();
  const [state, setState] = useState<ProfileLoadState>({ status: "loading" });
  const [getCurrentUser] = useState(() => createHttpGetCurrentUser());

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getCurrentUser();
      if (cancelled) return;

      if (!result.ok) {
        if (result.reason === "UNAUTHORIZED" || result.reason === "NETWORK") {
          router.replace(buildLoginUrl(PROFILE_RETURN_URL));
          return;
        }
        setState({ status: "error" });
        return;
      }

      setState({ status: "ready", user: result.user });
    })();

    return () => {
      cancelled = true;
    };
  }, [getCurrentUser, router]);

  return (
    <Layout className="profile-page">
      <SiteNavbar activeItemId="perfil" />
      <main id="main-content" className="profile-page__main">
        {state.status === "loading" ? (
          <p className="profile-page__status" role="status">
            Carregando seu perfil…
          </p>
        ) : null}

        {state.status === "error" ? (
          <div className="profile-page__panel" role="alert">
            <h1 className="profile-page__title">Meu perfil</h1>
            <p className="profile-page__error">
              Não foi possível carregar seu perfil. Tente novamente.
            </p>
          </div>
        ) : null}

        {state.status === "ready" ? (
          <div className="profile-page__panel">
            <h1 className="profile-page__title">Meu perfil</h1>
            <p className="profile-page__subtitle">
              Identidade da conta autenticada.
            </p>

            <section className="profile-page__section" aria-label="Identidade">
              <h2 className="profile-page__section-title">Identidade</h2>

              <dl className="profile-page__fields">
                <div className="profile-page__field">
                  <dt className="profile-page__label">E-mail</dt>
                  <dd className="profile-page__value">{state.user.email}</dd>
                </div>
                <div className="profile-page__field">
                  <dt className="profile-page__label">ID do usuário</dt>
                  <dd className="profile-page__value profile-page__value--mono">
                    {state.user.id}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        ) : null}
      </main>
      <Footer />
    </Layout>
  );
}
