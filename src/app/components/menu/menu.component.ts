import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CAKE_WEIGHTS_KG,
  CATEGORIES,
  NORMAL_THEME,
  THEME_CATEGORIES,
  calcUnitPrice,
  formatWeight,
  isThemedBirthday,
  startingFromPrice,
} from '../../data/products';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { CatalogSettingsService } from '../../services/catalog-settings.service';
import { ProductService } from '../../services/product.service';

export type MenuMode = 'preview' | 'full';
export type MenuFilter = 'All' | (typeof CATEGORIES)[number];

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnChanges {
  /** Home preview shows 3 per category; full menu page lists everything. */
  @Input() mode: MenuMode = 'preview';
  /** Optional initial filter when mode is full (e.g. Specialty). */
  @Input() initialFilter: MenuFilter = 'All';

  readonly cart = inject(CartService);
  private readonly catalog = inject(ProductService);
  private readonly catalogSettings = inject(CatalogSettingsService);

  readonly products = this.catalog.products;
  readonly categories = CATEGORIES;
  readonly previewLimit = 3;
  readonly weights = CAKE_WEIGHTS_KG;
  readonly themeCategories = THEME_CATEGORIES;
  readonly themeSurcharge = this.catalogSettings.themeSurchargeKes;
  readonly occasionThemes = this.catalogSettings.occasionThemes;
  readonly formatWeight = formatWeight;

  readonly filter = signal<MenuFilter>('All');

  readonly topProducts = computed(() =>
    this.products()
      .filter((p) => p.category === 'Whipped Cream')
      .slice(0, this.previewLimit)
  );

  readonly specialtyProducts = computed(() =>
    this.products()
      .filter((p) => p.category === 'Specialty')
      .slice(0, this.previewLimit)
  );

  readonly filteredProducts = computed(() => {
    const all = this.products();
    const filter = this.filter();
    if (filter === 'All') return all;
    return all.filter((p) => p.category === filter);
  });

  readonly customizing = signal<Product | null>(null);
  selectedFlavour = '';
  selectedThemeCategory: string = NORMAL_THEME;
  selectedTheme = '';
  selectedWeight = 1;
  customThemeDetail = '';
  allergyNotes = '';
  customMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilter'] || changes['mode']) {
      if (this.mode === 'full') {
        this.filter.set(this.initialFilter);
      }
    }
  }

  setFilter(next: MenuFilter): void {
    this.filter.set(next);
  }

  startingPrice(product: Product): number {
    return startingFromPrice(product);
  }

  priceHint(_product: Product): string {
    return 'from · by size';
  }

  isOccasionCategory(): boolean {
    return this.selectedThemeCategory === 'Birthdays / Special occasions';
  }

  resolvedTheme(): string {
    if (!this.isOccasionCategory()) return NORMAL_THEME;
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
      this.resolvedTheme(),
      this.selectedFlavour,
      this.themeSurcharge()
    );
  }

  showThemeExtra(): boolean {
    const product = this.customizing();
    if (!product?.themes?.length) return false;
    return isThemedBirthday(this.resolvedTheme());
  }

  onThemeCategoryChange(): void {
    if (this.isOccasionCategory()) {
      this.selectedTheme = this.occasionThemes()[0] ?? '';
    } else {
      this.selectedTheme = '';
      this.customThemeDetail = '';
    }
  }

  openCustomize(product: Product): void {
    this.customizing.set(product);
    this.selectedFlavour = product.flavours[0] ?? '';
    this.selectedThemeCategory = NORMAL_THEME;
    this.selectedTheme = '';
    this.selectedWeight = 1;
    this.customThemeDetail = '';
    this.allergyNotes = '';
    this.customMessage = '';
  }

  closeCustomize(): void {
    this.customizing.set(null);
  }

  needsThemeDetail(): boolean {
    return this.isOccasionCategory() && this.selectedTheme === 'Custom theme';
  }

  canAdd(): boolean {
    const product = this.customizing();
    if (!product || !this.selectedFlavour) return false;
    if (product.themes?.length) {
      if (!this.selectedThemeCategory) return false;
      if (this.isOccasionCategory() && !this.selectedTheme) return false;
      if (this.needsThemeDetail() && !this.customThemeDetail.trim()) return false;
    }
    if (product.pricedBy === 'kg' && !this.selectedWeight) return false;
    return true;
  }

  confirmAdd(): void {
    const product = this.customizing();
    if (!product || !this.canAdd()) return;

    const theme = product.themes?.length ? this.resolvedTheme().trim() : '';

    this.cart.add(product, {
      flavour: this.selectedFlavour,
      theme,
      weightKg: product.pricedBy === 'kg' ? Number(this.selectedWeight) : undefined,
      allergyNotes: this.allergyNotes,
      customMessage: this.customMessage,
    });
    this.closeCustomize();
  }
}
