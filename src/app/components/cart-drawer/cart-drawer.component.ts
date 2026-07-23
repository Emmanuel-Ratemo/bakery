import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatWeight } from '../../data/products';
import { CartItem } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  customerName = '';
  note = '';
  readonly ordered = signal(false);

  formatWeight(kg: number): string {
    return formatWeight(kg);
  }

  allergensText(item: CartItem): string {
    return item.product.allergies.join(', ');
  }

  order(): void {
    if (!this.cart.items().length) return;
    this.cart.orderViaWhatsApp(this.customerName, this.note);
    this.ordered.set(true);
  }
}
