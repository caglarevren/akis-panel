export type LoginError = "missing-fields" | "invalid-credentials" | "server-error";

export interface LoginState {
  success: boolean;
  error?: LoginError;
  // Echoed back so a failed attempt keeps the username/email field filled.
  // The password is never echoed.
  identifier?: string;
}
