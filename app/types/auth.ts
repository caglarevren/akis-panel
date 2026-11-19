export type LoginError = "missing-fields" | "invalid-credentials" | "server-error";

export interface LoginState {
  success: boolean;
  error?: LoginError;
  // Echoed back so a failed attempt keeps the email field filled.
  // The password is never echoed.
  email?: string;
}
