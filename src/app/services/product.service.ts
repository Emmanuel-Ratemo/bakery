import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PRODUCT_OVERRIDES_KEY } from '../admin/admin.config';
import { PRODUCT_DEFAULTS } from '../data/product-defaults';
import { PRODUCTS } from '../data/products';
import { Product } from '../models/product.model';
import { AdminAuthService } from './admin-auth.service';
import { CatalogSettingsService } from './catalog-settings.service';
import { GithubPublishService } from './github-publish.service';

export interface ProductOverride {
  pricePerUnit?: number;
  image?: string;
}

export type SaveTarget = 'file-api' | 'github' | 'browser';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly catalogSettings = inject(CatalogSettingsService);
  private readonly github = inject(GithubPublishService);
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

  async updatePrice(id: string, pricePerUnit: number): Promise<SaveTarget> {
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
      return 'file-api';
    }

    if (this.github.getToken()) {
      await this.publishOverrides({ [id]: { pricePerUnit: rounded } });
      this.patchLocal(id, { pricePerUnit: rounded });
      return 'github';
    }

    this.patchLocal(id, { pricePerUnit: rounded });
    this.writeBrowserOverrides();
    return 'browser';
  }

  async updateImage(id: string, imageDataUrl: string): Promise<SaveTarget> {
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
      return 'file-api';
    }

    if (this.github.getToken()) {
      const parsed = this.parseDataUrl(imageDataUrl);
      const publicPath = `assets/images/products/${id}.${parsed.ext}`;
      await this.github.putFile(
        `public/${publicPath}`,
        parsed.base64,
        `Admin: update ${id} product image`
      );
      await this.publishOverrides({ [id]: { image: publicPath } });
      this.patchLocal(id, { image: publicPath });
      return 'github';
    }

    this.patchLocal(id, { image: imageDataUrl });
    this.writeBrowserOverrides();
    return 'browser';
  }

  async resetProduct(id: string): Promise<SaveTarget> {
    const original = this.getOriginal(id);
    if (!original) return 'browser';

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
      this.overrides.update((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return 'file-api';
    }

    if (this.github.getToken()) {
      const current =
        (await this.github.readJson<Record<string, ProductOverride>>(
          'public/catalog-overrides.json'
        )) || {};
      delete current[id];
      await this.github.putJson(
        'public/catalog-overrides.json',
        current,
        `Admin: reset ${id} product overrides`
      );
      this.overrides.update((existing) => {
        const next = { ...existing };
        delete next[id];
        return next;
      });
      return 'github';
    }

    this.overrides.update((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    this.writeBrowserOverrides();
    return 'browser';
  }

  async resetAll(): Promise<void> {
    for (const product of PRODUCTS) {
      await this.resetProduct(product.id);
    }
  }

  private async publishOverrides(
    patch: Record<string, ProductOverride>
  ): Promise<void> {
    const current =
      (await this.github.readJson<Record<string, ProductOverride>>(
        'public/catalog-overrides.json'
      )) || {};
    for (const [id, values] of Object.entries(patch)) {
      current[id] = { ...current[id], ...values };
    }
    await this.github.putJson(
      'public/catalog-overrides.json',
      current,
      'Admin: update catalog overrides'
    );
  }

  private parseDataUrl(dataUrl: string): { ext: string; base64: string } {
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) throw new Error('Invalid image data.');
    const mime = match[1];
    const ext = mime.includes('png')
      ? 'png'
      : mime.includes('webp')
        ? 'webp'
        : 'jpg';
    return { ext, base64: match[2] };
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
