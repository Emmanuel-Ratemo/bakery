import { Component } from '@angular/core';

@Component({
  selector: 'app-promo',
  standalone: true,
  templateUrl: './promo.component.html',
  styleUrl: './promo.component.scss',
})
export class PromoComponent {
  goTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
