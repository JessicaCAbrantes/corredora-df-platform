export type RegistrationUiStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "registered";

export type RegistrationUiErrorCode =
  | "REGISTRATION_CLOSED"
  | "EVENT_FULL"
  | "ALREADY_REGISTERED"
  | "EVENT_INACTIVE"
  | "EVENT_NOT_FOUND"
  | "UNKNOWN";

export type RegistrationUiState = {
  status: RegistrationUiStatus;
  message?: string;
  errorCode?: RegistrationUiErrorCode;
  registrationId?: string;
};

export const INITIAL_REGISTRATION_UI_STATE: RegistrationUiState = {
  status: "idle",
};
