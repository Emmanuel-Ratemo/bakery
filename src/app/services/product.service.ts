import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PRODUCT_OVERRIDES_KEY } from '../admin/admin.config';
import { PRODUCT_DEFAULTS } from '../data/product-defaults';
import { PRODUCTS } from '../data/products';
import { Product } from '../models/product.model';
import { AdminAuthService } from './admin-auth.service';
import { CatalogSettingsService } from './catalog-settings.service';

export interface ProductOverride {
  pricePerUnit?: number;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly catalogSettings = inject(CatalogSettingsService);
  private readonly overrides = signal<Record<string, ProductOverride>>({});
  private readonly apiReady = signal(false);

  readonly products = computed(() =>
    PRODUCTS.map((product) => {
      const withOverride = this.applyOverride(product);
      if (!withOverride.themes?.length) return withOverride;
      return {
        ...withOverride,
        themes: [...this.catalogSettings.occasionThemes()],
      };
    })
  );

  readonly usingFileApi = this.apiReady.asReadonly();

  constructor() {
    void this.bootstrap();
  }

  getById(id: string): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  getOriginal(id: string): Product | undefined {
    const product = PRODUCTS.find((p) => p.id === id);
    const defaults = PRODUCT_DEFAULTS[id];
    if (!product || !defaults) return product;
    return {
      ...product,
      pricePerUnit: defaults.pricePerUnit,
      image: defaults.image,
    };
  }

  async updatePrice(id: string, pricePerUnit: number): Promise<void> {
    if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) {
      throw new Error('Enter a valid price.');
    }
    const rounded = Math.round(pricePerUnit);

    if (this.apiReady()) {
      await firstValueFrom(
        this.http.post(`/api/products/${id}`, {
          password: this.requireApiPassword(),
          pricePerUnit: rounded,
        })
      );
      this.patchLocal(id, { pricePerUnit: rounded });
      return;
    }

    this.patchLocal(id, { pricePerUnit: rounded });
    this.writeBrowserOverrides();
  }

  async updateImage(id: string, imageDataUrl: string): Promise<void> {
    if (!imageDataUrl.startsWith('data:image/')) {
      throw new Error('Please choose an image file.');
    }

    if (this.apiReady()) {
      const response = await firstValueFrom(
        this.http.post<{ image: string }>(`/api/products/${id}/image`, {
          password: this.requireApiPassword(),
          dataUrl: imageDataUrl,
        })
      );
      this.patchLocal(id, { image: response.image });
      return;
    }

    this.patchLocal(id, { image: imageDataUrl });
    this.writeBrowserOverrides();
  }

  async resetProduct(id: string): Promise<void> {
    const original = this.getOriginal(id);
    if (!original) return;

    if (this.apiReady()) {
      await firstValueFrom(
        this.http.delete(`/api/products/${id}`, {
          body: {
            password: this.requireApiPassword(),
            restore: {
              pricePerUnit: original.pricePerUnit,
              image: original.image,
            },
          },
        })
      );
      this.patchLocal(id, {
        pricePerUnit: original.pricePerUnit,
        image: original.image,
      });
      // Clear override so catalog defaults apply after restore
      this.overrides.update((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }

    this.overrides.update((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    this.writeBrowserOverrides();
  }

  async resetAll(): Promise<void> {
    for (const product of PRODUCTS) {
      await this.resetProduct(product.id);
    }
  }

  private async bootstrap(): Promise<void> {
    try {
      await firstValueFrom(this.http.get('/api/health'));
      this.apiReady.set(true);
      const fileOverrides = await firstValueFrom(
        this.http.get<Record<string, ProductOverride>>('/api/overrides')
      );
      this.overrides.set(fileOverrides || {});
      return;
    } catch {
      this.apiReady.set(false);
    }

    try {
      const fileOverrides = await firstValueFrom(
        this.http.get<Record<string, ProductOverride>>(
          `catalog-overrides.json?t=${Date.now()}`
        )
      );
      this.overrides.set(fileOverrides || {});
    } catch {
      this.overrides.set(this.readBrowserOverrides());
    }
  }

  private requireApiPassword(): string {
    const password = this.auth.getApiPassword();
    if (!password) {
      throw new Error('Sign in again to save files with the admin API.');
    }
    return password;
  }

  private patchLocal(id: string, patch: ProductOverride): void {
    this.overrides.update((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }

  private applyOverride(product: Product): Product {
    const override = this.overrides()[product.id];
    if (!override) return product;
    return {
      ...product,
      pricePerUnit: override.pricePerUnit ?? product.pricePerUnit,
      image: override.image ?? product.image,
    };
  }

  private readBrowserOverrides(): Record<string, ProductOverride> {
    try {
      const raw = localStorage.getItem(PRODUCT_OVERRIDES_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, ProductOverride>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private writeBrowserOverrides(): void {
    if (this.apiReady()) return;
    try {
      localStorage.setItem(
        PRODUCT_OVERRIDES_KEY,
        JSON.stringify(this.overrides())
      );
    } catch {
      // ignore quota errors
    }
  }
}
