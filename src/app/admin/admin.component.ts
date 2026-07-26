import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { fileToCompressedDataUrl } from './image-utils';
import { DEFAULT_CATALOG_SETTINGS } from '../data/catalog-settings';
import { Product } from '../models/product.model';
import { AdminAuthService } from '../services/admin-auth.service';
import { CatalogSettingsService } from '../services/catalog-settings.service';
import { GithubPublishService } from '../services/github-publish.service';
import { ProductService, SaveTarget } from '../services/product.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  readonly auth = inject(AdminAuthService);
  readonly products = inject(ProductService);
  readonly catalogSettings = inject(CatalogSettingsService);
  readonly github = inject(GithubPublishService);

  password = '';
  githubToken = '';
  loginError = signal('');
  statusMessage = signal('');
  readonly draftPrices = signal<Record<string, number>>({});
  readonly busyId = signal<string | null>(null);
  readonly draftThemeSurcharge = signal(DEFAULT_CATALOG_SETTINGS.themeSurchargeKes);
  readonly draftThemes = signal<string[]>([
    ...DEFAULT_CATALOG_SETTINGS.occasionThemes,
  ]);
  newThemeName = '';

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.seedDrafts();
    }
  }

  async login(): Promise<void> {
    this.loginError.set('');
    const ok = await this.auth.login(this.password);
    if (!ok) {
      this.loginError.set(
        'Wrong password, or ADMIN_PASSWORD is not configured yet.'
      );
      return;
    }
    this.password = '';
    this.seedDrafts();
  }

  logout(): void {
    this.auth.logout();
    this.github.clearToken();
    this.githubToken = '';
    this.password = '';
    this.statusMessage.set('');
  }

  saveGithubToken(): void {
    this.github.setToken(this.githubToken);
    this.githubToken = '';
    this.statusMessage.set(
      this.github.hasToken()
        ? 'GitHub token saved for this browser tab. Uploads will commit to the live repo.'
        : 'GitHub token cleared.'
    );
  }

  clearGithubToken(): void {
    this.github.clearToken();
    this.statusMessage.set('GitHub token cleared.');
  }

  seedDrafts(): void {
    const drafts: Record<string, number> = {};
    for (const product of this.products.products()) {
      drafts[product.id] = product.pricePerUnit;
    }
    this.draftPrices.set(drafts);
    this.draftThemeSurcharge.set(this.catalogSettings.themeSurchargeKes());
    this.draftThemes.set([...this.catalogSettings.occasionThemes()]);
  }

  setDraftPrice(id: string, value: number | string): void {
    const amount = Number(value);
    this.draftPrices.update((current) => ({ ...current, [id]: amount }));
  }

  setDraftTheme(index: number, value: string): void {
    this.draftThemes.update((themes) =>
      themes.map((theme, i) => (i === index ? value : theme))
    );
  }

  addTheme(): void {
    const name = this.newThemeName.trim();
    if (!name) return;
    if (this.draftThemes().some((t) => t.toLowerCase() === name.toLowerCase())) {
      this.statusMessage.set('That theme is already in the list.');
      return;
    }
    this.draftThemes.update((themes) => [...themes, name]);
    this.newThemeName = '';
  }

  removeTheme(index: number): void {
    this.draftThemes.update((themes) => themes.filter((_, i) => i !== index));
  }

  private describeSave(target: SaveTarget, okMessage: string): string {
    if (target === 'file-api') return okMessage;
    if (target === 'github') {
      return `${okMessage} Committed to GitHub — live site refreshes after Pages redeploys (about 1–2 min).`;
    }
    return `${okMessage} Saved in this browser only. On the live site, paste a GitHub token below so everyone sees the change.`;
  }

  async saveThemes(): Promise<void> {
    const themes = this.draftThemes()
      .map((t) => t.trim())
      .filter(Boolean);
    const surcharge = Number(this.draftThemeSurcharge());
    if (!themes.length) {
      this.statusMessage.set('Keep at least one occasion theme.');
      return;
    }
    if (!Number.isFinite(surcharge) || surcharge < 0) {
      this.statusMessage.set('Enter a valid theme price.');
      return;
    }

    this.busyId.set('themes');
    try {
      const { target } = await this.catalogSettings.save({
        themeSurchargeKes: surcharge,
        occasionThemes: themes,
      });
      this.seedDrafts();
      this.statusMessage.set(
        this.describeSave(target, 'Saved occasion themes and add-on price.')
      );
    } catch (error) {
      this.statusMessage.set(
        error instanceof Error ? error.message : 'Could not save themes.'
      );
    } finally {
      this.busyId.set(null);
    }
  }

  async resetThemes(): Promise<void> {
    if (!confirm('Reset occasion themes and theme price to defaults?')) return;
    this.busyId.set('themes');
    try {
      const { target } = await this.catalogSettings.reset();
      this.seedDrafts();
      this.statusMessage.set(
        this.describeSave(target, 'Occasion themes reset to defaults.')
      );
    } catch (error) {
      this.statusMessage.set(
        error instanceof Error ? error.message : 'Could not reset themes.'
      );
    } finally {
      this.busyId.set(null);
    }
  }

  async savePrice(product: Product): Promise<void> {
    const amount = this.draftPrices()[product.id];
    if (!Number.isFinite(amount) || amount < 0) {
      this.statusMessage.set('Enter a valid price.');
      return;
    }
    this.busyId.set(product.id);
    try {
      const target = await this.products.updatePrice(product.id, amount);
      this.statusMessage.set(
        this.describeSave(target, `Saved ${product.name} price.`)
      );
    } catch (error) {
      this.statusMessage.set(
        error instanceof Error ? error.message : 'Could not save price.'
      );
    } finally {
      this.busyId.set(null);
    }
  }

  async onImageSelected(product: Product, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.busyId.set(product.id);
    this.statusMessage.set('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      const target = await this.products.updateImage(product.id, dataUrl);
      this.statusMessage.set(
        this.describeSave(target, `Saved ${product.name} image.`)
      );
    } catch (error) {
      this.statusMessage.set(
        error instanceof Error ? error.message : 'Could not upload image.'
      );
    } finally {
      this.busyId.set(null);
      input.value = '';
    }
  }

  async resetProduct(product: Product): Promise<void> {
    this.busyId.set(product.id);
    try {
      const target = await this.products.resetProduct(product.id);
      const restored = this.products.getById(product.id);
      if (restored) {
        this.draftPrices.update((current) => ({
          ...current,
          [product.id]: restored.pricePerUnit,
        }));
      }
      this.statusMessage.set(
        this.describeSave(target, `Reset ${product.name}.`)
      );
    } catch (error) {
      this.statusMessage.set(
        error instanceof Error ? error.message : 'Could not reset product.'
      );
    } finally {
      this.busyId.set(null);
    }
  }

  async resetAll(): Promise<void> {
    if (!confirm('Reset all product prices and images to defaults?')) return;
    try {
      await this.products.resetAll();
      this.seedDrafts();
      this.statusMessage.set('All products reset to defaults.');
    } catch (error) {
      this.statusMessage.set(
        error instanceof Error ? error.message : 'Could not reset products.'
      );
    }
  }
}
