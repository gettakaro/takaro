const LAST_USED_DOMAIN_COOKIE_NAME = 'takaro-last-used-domain';

export function getLastUsedDomainId(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LAST_USED_DOMAIN_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function setLastUsedDomainId(domainId: string): void {
  if (typeof document === 'undefined') return;

  // Set cookie with 1 year expiry
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);

  document.cookie = `${LAST_USED_DOMAIN_COOKIE_NAME}=${encodeURIComponent(domainId)}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
}

export function clearLastUsedDomainId(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${LAST_USED_DOMAIN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}
