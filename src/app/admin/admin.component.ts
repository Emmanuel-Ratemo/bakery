import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { fileToCompressedDataUrl } from './image-utils';
import { AdminAuthService } from '../services/admin-auth.service';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

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

  password = '';
  loginError = signal('');
  statusMessage = signal('');
  readonly draftPrices = signal<Record<string, number>>({});
  readonly busyId = signal<string | null>(null);

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
  }

  setDraftPrice(id: string, value: number | string): void {
    const amount = Number(value);
    this.draftPrices.update((current) => ({ ...current, [id]: amount }));
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
    if (!confirm('Reset all prices and images to defaults?')) return;
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
