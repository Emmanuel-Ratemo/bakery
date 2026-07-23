import { Injectable, computed, signal } from '@angular/core';
import {
  AddToCartOptions,
  CartItem,
  Product,
} from '../models/product.model';
import {
  WHATSAPP_NUMBER,
  calcUnitPrice,
  formatWeight,
} from '../data/products';

function cleanText(value: string, max = 120): string {
  return value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

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
      (sum, item) => sum + item.unitPrice * item.quantity,
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

  add(product: Product, options: AddToCartOptions): void {
    const flavour = cleanText(options.flavour, 40);
    if (!flavour) return;

    const theme = cleanText(options.theme ?? '', 60);
    if (product.themes?.length && !theme) return;

    const weightKg =
      product.pricedBy === 'kg' ? (options.weightKg ?? 1) : 0;
    if (product.pricedBy === 'kg' && (weightKg < 0.5 || weightKg > 5)) return;

    const allergyNotes = cleanText(options.allergyNotes ?? '', 120);
    const customMessage = cleanText(options.customMessage ?? '', 80);
    const unitPrice = calcUnitPrice(product, weightKg || 1, theme);

    this.itemsSignal.update((items) => {
      const existing = items.find(
        (i) =>
          i.product.id === product.id &&
          i.flavour === flavour &&
          i.theme === theme &&
          i.weightKg === weightKg &&
          i.allergyNotes === allergyNotes &&
          i.customMessage === customMessage
      );

      if (existing) {
        return items.map((i) =>
          i.lineId === existing.lineId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      const line: CartItem = {
        lineId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product,
        quantity: 1,
        flavour,
        theme,
        weightKg,
        unitPrice,
        allergyNotes,
        customMessage,
      };
      return [...items, line];
    });

    this.open.set(true);
  }

  increase(lineId: string): void {
    this.itemsSignal.update((items) =>
      items.map((i) =>
        i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }

  decrease(lineId: string): void {
    this.itemsSignal.update((items) =>
      items
        .map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  remove(lineId: string): void {
    this.itemsSignal.update((items) =>
      items.filter((i) => i.lineId !== lineId)
    );
  }

  clear(): void {
    this.itemsSignal.set([]);
  }

  orderViaWhatsApp(customerName: string, note = ''): void {
    const items = this.itemsSignal();
    if (!items.length) return;

    const name = cleanText(customerName, 60);
    const extraNote = cleanText(note, 120);

    const lines = items.flatMap((i) => {
      const size =
        i.product.pricedBy === 'kg' ? ` · ${formatWeight(i.weightKg)}` : '';
      const themeBit = i.theme ? ` — ${i.theme}` : '';
      const title = `• ${i.quantity}x ${i.product.name}${themeBit}${size} (${i.flavour}) — KSh ${(i.unitPrice * i.quantity).toLocaleString()}`;

      const block = [title, `  Allergens: ${i.product.allergies.join(', ')}`];
      if (i.customMessage) block.push(`  Cake message: "${i.customMessage}"`);
      if (i.allergyNotes) block.push(`  Allergy notes: ${i.allergyNotes}`);
      return block;
    });

    const message = [
      `Hello Bree's Bakery! I'd like to place an order.`,
      '',
      ...lines,
      '',
      `*Total: KSh ${this.total().toLocaleString()}*`,
      name ? `Name: ${name}` : '',
      extraNote ? `Note: ${extraNote}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
