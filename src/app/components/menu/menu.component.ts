import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PRODUCTS } from '../../data/products';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  readonly cart = inject(CartService);
  readonly products = PRODUCTS.slice(0, 6);
  readonly infoId = signal<string | null>(null);

  add(product: Product): void {
    this.cart.add(product);
  }

  toggleInfo(id: string): void {
    this.infoId.update((current) => (current === id ? null : id));
  }
}
