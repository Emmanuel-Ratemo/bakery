import { ADMIN_PASSWORD_HASH } from './admin.credentials';

/** Session flag in sessionStorage (not the password). */
export const ADMIN_SESSION_KEY = 'brees-bakery-admin-session';
export const PRODUCT_OVERRIDES_KEY = 'brees-bakery-product-overrides';
export const CATALOG_SETTINGS_KEY = 'brees-bakery-catalog-settings';

export { ADMIN_PASSWORD_HASH };

/** SHA-256 hex digest of the admin password (browser). */
export async function hashAdminPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
