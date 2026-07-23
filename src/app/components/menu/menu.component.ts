import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CAKE_WEIGHTS_KG,
  PRODUCTS,
  THEME_SURCHARGE_KES,
  calcUnitPrice,
  formatWeight,
  isThemedBirthday,
} from '../../data/products';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  readonly cart = inject(CartService);
  readonly products = PRODUCTS;
  readonly weights = CAKE_WEIGHTS_KG;
  readonly themeSurcharge = THEME_SURCHARGE_KES;
  readonly formatWeight = formatWeight;

  readonly customizing = signal<Product | null>(null);
  selectedFlavour = '';
  selectedTheme = '';
  selectedWeight = 1;
  customThemeDetail = '';
  allergyNotes = '';
  customMessage = '';

  startingPrice(product: Product): number {
    return product.pricePerUnit;
  }

  priceHint(product: Product): string {
    if (product.id === 'birthday') return 'per kg + theme';
    return product.pricedBy === 'kg' ? 'per kg' : 'each';
  }

  resolvedTheme(): string {
    return this.selectedTheme === 'Custom theme'
      ? `Custom: ${this.customThemeDetail}`
      : this.selectedTheme;
  }

  currentPrice(): number {
    const product = this.customizing();
    if (!product) return 0;
    return calcUnitPrice(
      product,
      product.pricedBy === 'kg' ? Number(this.selectedWeight) : 1,
      this.resolvedTheme()
    );
  }

  showThemeExtra(): boolean {
    const product = this.customizing();
    if (!product?.themes?.length) return false;
    return isThemedBirthday(this.resolvedTheme());
  }

  openCustomize(product: Product): void {
    this.customizing.set(product);
    this.selectedFlavour = product.flavours[0] ?? '';
    this.selectedTheme = product.themes?.[0] ?? '';
    this.selectedWeight = 1;
    this.customThemeDetail = '';
    this.allergyNotes = '';
    this.customMessage = '';
  }

  closeCustomize(): void {
    this.customizing.set(null);
  }

  needsThemeDetail(): boolean {
    return this.selectedTheme === 'Custom theme';
  }

  canAdd(): boolean {
    const product = this.customizing();
    if (!product || !this.selectedFlavour) return false;
    if (product.themes?.length && !this.selectedTheme) return false;
    if (this.needsThemeDetail() && !this.customThemeDetail.trim()) return false;
    if (product.pricedBy === 'kg' && !this.selectedWeight) return false;
    return true;
  }

  confirmAdd(): void {
    const product = this.customizing();
    if (!product || !this.canAdd()) return;

    const theme =
      this.selectedTheme === 'Custom theme'
        ? `Custom: ${this.customThemeDetail.trim()}`
        : this.selectedTheme;

    this.cart.add(product, {
      flavour: this.selectedFlavour,
      theme: product.themes?.length ? theme : '',
      weightKg: product.pricedBy === 'kg' ? Number(this.selectedWeight) : undefined,
      allergyNotes: this.allergyNotes,
      customMessage: this.customMessage,
    });
    this.closeCustomize();
  }
}
