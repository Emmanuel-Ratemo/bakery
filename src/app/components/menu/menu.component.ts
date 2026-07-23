import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRODUCTS } from '../../data/products';
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
  readonly customizing = signal<Product | null>(null);
  selectedFlavour = '';
  selectedTheme = '';
  customThemeDetail = '';
  allergyNotes = '';
  customMessage = '';

  openCustomize(product: Product): void {
    this.customizing.set(product);
    this.selectedFlavour = product.flavours[0] ?? '';
    this.selectedTheme = product.themes?.[0] ?? '';
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
      allergyNotes: this.allergyNotes,
      customMessage: this.customMessage,
    });
    this.closeCustomize();
  }
}
