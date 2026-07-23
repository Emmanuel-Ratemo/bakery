import { Component, signal } from '@angular/core';
import { WHATSAPP_NUMBER } from '../../data/products';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  templateUrl: './whatsapp-float.component.html',
  styleUrl: './whatsapp-float.component.scss',
})
export class WhatsappFloatComponent {
  readonly open = signal(false);
  private readonly number = WHATSAPP_NUMBER;

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  startChat(): void {
    const message =
      "Hi Bree's Bakery! I'd like to place an order / ask about your menu.";
    const url = `https://wa.me/${this.number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    this.close();
  }
}
