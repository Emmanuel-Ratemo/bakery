import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product } from '../models/product.model';
import { WHATSAPP_NUMBER } from '../data/products';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>([]);
  readonly open = signal(false);

  readonly items = this.itemsSignal.asReadonly();
  readonly count = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly total = computed(() =>
    this.itemsSignal().reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  );

  openCart(): void {
    this.open.set(true);
  }

  closeCart(): void {
    this.open.set(false);
  }

  toggleCart(): void {
    this.open.update((v) => !v);
  }

  add(product: Product): void {
    this.itemsSignal.update((items) => {
      const existing = items.find((i) => i.product.id === product.id);
      if (existing) {
        return items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...items, { product, quantity: 1 }];
    });
    this.open.set(true);
  }

  increase(productId: string): void {
    this.itemsSignal.update((items) =>
      items.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }

  decrease(productId: string): void {
    this.itemsSignal.update((items) =>
      items
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  remove(productId: string): void {
    this.itemsSignal.update((items) =>
      items.filter((i) => i.product.id !== productId)
    );
  }

  clear(): void {
    this.itemsSignal.set([]);
  }

  orderViaWhatsApp(customerName: string, note = ''): void {
    const items = this.itemsSignal();
    if (!items.length) return;

    const lines = items.map(
      (i) =>
        `• ${i.quantity}x ${i.product.name} — KSh ${(i.product.price * i.quantity).toLocaleString()}`
    );

    const message = [
      `Hello Bree's Bakery! I'd like to place an order.`,
      '',
      ...lines,
      '',
      `*Total: KSh ${this.total().toLocaleString()}*`,
      customerName.trim() ? `\nName: ${customerName.trim()}` : '',
      note.trim() ? `Note: ${note.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
