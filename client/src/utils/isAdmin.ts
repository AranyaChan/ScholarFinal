/** Must match server ADMIN_EMAIL and the email on your Auth0 account. */
export function isAdminUser(email?: string | null): boolean {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || !email) return false;
  return email.trim().toLowerCase() === adminEmail;
}
