// Only same-origin relative paths are allowed as post-login redirect targets,
// so a crafted `callbackUrl` can't send a freshly signed-in user to another site.
export function safeRedirect(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
