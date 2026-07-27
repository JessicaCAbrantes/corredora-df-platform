"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  createMockRegisterForEvent,
  parseRegisterMockOverride,
  type RegisterForEvent,
} from "../application/register-for-event";
import { buildLoginUrl } from "../auth/build-login-url";
import {
  INITIAL_REGISTRATION_UI_STATE,
  type RegistrationUiState,
} from "../types/registration-ui";
import { mapRegisterResultToUiState } from "../utils/map-register-result-to-ui-state";
import { getSession as getHttpSession } from "../../auth/services/http-get-session";

export type UseRegisterForEventActionOptions = {
  eventId: string;
  slug: string;
  getSession?: () => Promise<{ userId: string } | null>;
  registerForEvent?: RegisterForEvent;
  redirectToLogin?: (returnUrl: string) => void;
};

/**
 * Registration UI Handler — interaction + auth gate + application port.
 * No HTTP, no domain rules. Maps UC result → UI state only.
 */
export function useRegisterForEventAction({
  eventId,
  slug,
  getSession = getHttpSession,
  registerForEvent,
  redirectToLogin,
}: UseRegisterForEventActionOptions) {
  const router = useRouter();
  const [state, setState] = useState<RegistrationUiState>(
    INITIAL_REGISTRATION_UI_STATE,
  );

  const navigateToLogin = useCallback(
    (returnUrl: string) => {
      if (redirectToLogin) {
        redirectToLogin(returnUrl);
        return;
      }
      router.push(buildLoginUrl(returnUrl));
    },
    [redirectToLogin, router],
  );

  const onRegisterAction = useCallback(async () => {
    const session = await getSession();

    if (!session) {
      navigateToLogin(`/corridas/${slug}`);
      return;
    }

    setState({ status: "loading" });

    const register =
      registerForEvent ??
      createMockRegisterForEvent({
        override: parseRegisterMockOverride(
          new URLSearchParams(window.location.search).get("register"),
        ),
      });

    const result = await register({
      eventId,
      userId: session.userId,
    });

    setState(mapRegisterResultToUiState(result));
  }, [eventId, slug, getSession, registerForEvent, navigateToLogin]);

  return {
    state,
    onRegisterAction,
  };
}
