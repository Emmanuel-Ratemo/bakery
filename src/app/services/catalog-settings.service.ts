import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CATALOG_SETTINGS_KEY } from '../admin/admin.config';
import {
  CatalogSettings,
  DEFAULT_CATALOG_SETTINGS,
  normalizeCatalogSettings,
} from '../data/catalog-settings';
import { AdminAuthService } from './admin-auth.service';
import { GithubPublishService } from './github-publish.service';
import { SaveTarget } from './product.service';

@Injectable({ providedIn: 'root' })
export class CatalogSettingsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly github = inject(GithubPublishService);
  private readonly settingsSignal = signal<CatalogSettings>({
    ...DEFAULT_CATALOG_SETTINGS,
    occasionThemes: [...DEFAULT_CATALOG_SETTINGS.occasionThemes],
  });
  private readonly apiReady = signal(false);

  readonly settings = this.settingsSignal.asReadonly();
  readonly themeSurchargeKes = computed(
    () => this.settingsSignal().themeSurchargeKes
  );
  readonly occasionThemes = computed(
    () => this.settingsSignal().occasionThemes
  );
  readonly usingFileApi = this.apiReady.asReadonly();

  constructor() {
    void this.bootstrap();
  }

  async save(next: CatalogSettings): Promise<{ settings: CatalogSettings; target: SaveTarget }> {
    const normalized = normalizeCatalogSettings(next);

    if (this.apiReady()) {
      const saved = await firstValueFrom(
        this.http.post<CatalogSettings>('/api/settings', {
          password: this.requireApiPassword(),
          ...normalized,
        })
      );
      this.settingsSignal.set(normalizeCatalogSettings(saved));
      return { settings: this.settingsSignal(), target: 'file-api' };
    }

    if (this.github.getToken()) {
      await this.github.putJson(
        'public/catalog-settings.json',
        normalized,
        'Admin: update occasion themes and surcharge'
      );
      this.settingsSignal.set(normalized);
      return { settings: normalized, target: 'github' };
    }

    this.settingsSignal.set(normalized);
    this.writeBrowser();
    return { settings: normalized, target: 'browser' };
  }

  async reset(): Promise<{ settings: CatalogSettings; target: SaveTarget }> {
    return this.save({ ...DEFAULT_CATALOG_SETTINGS });
  }

  private async bootstrap(): Promise<void> {
    try {
      await firstValueFrom(this.http.get('/api/health'));
      this.apiReady.set(true);
      const remote = await firstValueFrom(
        this.http.get<CatalogSettings>('/api/settings')
      );
      this.settingsSignal.set(normalizeCatalogSettings(remote));
      return;
    } catch {
      this.apiReady.set(false);
    }

    try {
      const file = await firstValueFrom(
        this.http.get<CatalogSettings>(
          `catalog-settings.json?t=${Date.now()}`
        )
      );
      this.settingsSignal.set(normalizeCatalogSettings(file));
    } catch {
      this.settingsSignal.set(this.readBrowser());
    }
  }

  private requireApiPassword(): string {
    const password = this.auth.getApiPassword();
    if (!password) {
      throw new Error('Sign in again to save settings with the admin API.');
    }
    return password;
  }

  private readBrowser(): CatalogSettings {
    try {
      const raw = localStorage.getItem(CATALOG_SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_CATALOG_SETTINGS };
      return normalizeCatalogSettings(JSON.parse(raw) as CatalogSettings);
    } catch {
      return { ...DEFAULT_CATALOG_SETTINGS };
    }
  }

  private writeBrowser(): void {
    if (this.apiReady()) return;
    try {
      localStorage.setItem(
        CATALOG_SETTINGS_KEY,
        JSON.stringify(this.settingsSignal())
      );
    } catch {
      // ignore
    }
  }
}
