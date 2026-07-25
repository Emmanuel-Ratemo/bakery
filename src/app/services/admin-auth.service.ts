import { Injectable, signal } from '@angular/core';
import {
  ADMIN_PASSWORD_HASH,
  ADMIN_SESSION_KEY,
  hashAdminPassword,
} from '../admin/admin.config';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly loggedIn = signal(false);
  /** Kept in memory only while the tab is open — used for local admin-api calls. */
  private readonly sessionPassword = signal<string | null>(null);

  readonly isLoggedIn = this.loggedIn.asReadonly();

  constructor() {
    // Session flag alone is not enough: password must be re-entered after refresh
    // so file-API calls still have a secret to send. Clear stale flags.
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
  }

  async login(password: string): Promise<boolean> {
    if (!ADMIN_PASSWORD_HASH) {
      this.clear();
      return false;
    }

    const digest = await hashAdminPassword(password);
    if (digest !== ADMIN_PASSWORD_HASH) {
      this.clear();
      return false;
    }

    this.sessionPassword.set(password);
    this.loggedIn.set(true);
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    } catch {
      // ignore
    }
    return true;
  }

  logout(): void {
    this.clear();
  }

  /** Plain password for local admin-api only; null if not signed in this session. */
  getApiPassword(): string | null {
    return this.sessionPassword();
  }

  private clear(): void {
    this.sessionPassword.set(null);
    this.loggedIn.set(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
  }
}
