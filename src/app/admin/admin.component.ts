import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { fileToCompressedDataUrl } from './image-utils';
import { DEFAULT_CATALOG_SETTINGS } from '../data/catalog-settings';
import { Product } from '../models/product.model';
import { AdminAuthService } from '../services/admin-auth.service';
import { CatalogSettingsService } from '../services/catalog-settings.service';
import { ProductService } from '../services/product.service';

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

  password = '';
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
    this.password = '';
    this.statusMessage.set('');
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
      await this.catalogSettings.save({
        themeSurchargeKes: surcharge,
        occasionThemes: themes,
      });
      this.seedDrafts();
      this.statusMessage.set(
        this.catalogSettings.usingFileApi()
          ? 'Saved occasion themes and price to catalog-settings.json + products.ts.'
          : 'Saved occasion themes and price in this browser only. Run npm run admin-api to write files.'
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
      await this.catalogSettings.reset();
      this.seedDrafts();
      this.statusMessage.set('Occasion themes reset to defaults.');
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
      await this.products.updatePrice(product.id, amount);
      this.statusMessage.set(
        this.products.usingFileApi()
          ? `Saved ${product.name} price to files (products.ts + catalog-overrides.json).`
          : `Saved ${product.name} price in this browser only. Start admin-api to write files.`
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
      await this.products.updateImage(product.id, dataUrl);
      this.statusMessage.set(
        this.products.usingFileApi()
          ? `Saved ${product.name} image to public/assets/images/products and updated products.ts.`
          : `Saved ${product.name} image in this browser only. Run npm run admin-api to write files.`
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
      await this.products.resetProduct(product.id);
      const restored = this.products.getById(product.id);
      if (restored) {
        this.draftPrices.update((current) => ({
          ...current,
          [product.id]: restored.pricePerUnit,
        }));
      }
      this.statusMessage.set(`Reset ${product.name} to defaults.`);
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
