// The shared account reviewers use to try the panel. Single source for the
// seed (which creates it and resets its password) and the hint on the login
// page. This is a deliberately public demo credential; never reuse it for a
// real account.
export const DEMO_ACCOUNT = {
  name: "Pelin Kilit",
  username: "pelin.kilit",
  email: "pelin.kilit@example.com",
  password: "123456",
} as const;
