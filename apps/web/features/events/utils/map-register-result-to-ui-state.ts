import type { RegisterForEventError } from "../application/register-for-event";
import type {
  RegistrationUiErrorCode,
  RegistrationUiState,
} from "../types/registration-ui";

/**
 * Presentation mapping only — does not decide business outcomes.
 */
export function mapRegisterResultToUiState(
  result:
    | { ok: true; registrationId: string }
    | { ok: false; error: RegisterForEventError },
): RegistrationUiState {
  if (result.ok) {
    return {
      status: "success",
      message: "Inscrição confirmada",
      registrationId: result.registrationId,
    };
  }

  switch (result.error) {
    case "ALREADY_REGISTERED":
      return {
        status: "registered",
        message: "Você já está inscrito",
        errorCode: "ALREADY_REGISTERED",
      };
    case "REGISTRATION_CLOSED":
      return {
        status: "error",
        message: "Inscrições encerradas",
        errorCode: "REGISTRATION_CLOSED",
      };
    case "EVENT_FULL":
      return {
        status: "error",
        message: "Não há vagas",
        errorCode: "EVENT_FULL",
      };
    case "EVENT_INACTIVE":
    case "EVENT_NOT_FOUND":
      return {
        status: "error",
        message: "Corrida indisponível",
        errorCode: result.error as RegistrationUiErrorCode,
      };
    case "UNAUTHENTICATED":
      // Auth gate should prevent this; treat as generic failure if it appears.
      return {
        status: "error",
        message: "Não foi possível concluir. Tente novamente.",
        errorCode: "UNKNOWN",
      };
    case "UNKNOWN":
    default:
      return {
        status: "error",
        message: "Não foi possível concluir. Tente novamente.",
        errorCode: "UNKNOWN",
      };
  }
}
