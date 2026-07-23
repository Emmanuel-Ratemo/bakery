import { Component, computed, signal } from '@angular/core';
import { CATEGORIES, GALLERY } from '../../data/products';

@Component({
  selector: 'app-explore',
  standalone: true,
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss',
})
export class ExploreComponent {
  readonly categories = CATEGORIES;
  readonly active = signal<(typeof CATEGORIES)[number] | 'All'>('Cake');

  readonly items = computed(() => {
    const cat = this.active();
    if (cat === 'All') return GALLERY;
    return GALLERY.filter((g) => g.category === cat);
  });

  select(category: (typeof CATEGORIES)[number]): void {
    this.active.set(category);
  }
}
