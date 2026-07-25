import { Component, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  private readonly router = inject(Router);
  readonly scrolled = signal(true);

  constructor() {
    this.syncHeaderSolid();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.syncHeaderSolid());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isHome()) {
      this.scrolled.set(window.scrollY > 40);
    }
  }

  async goHomeSection(id: string): Promise<void> {
    if (!this.isHome()) {
      await this.router.navigate(['/'], { fragment: id });
      setTimeout(() => this.scrollTo(id), 80);
      return;
    }
    this.scrollTo(id);
  }

  async goHome(): Promise<void> {
    if (!this.isHome()) {
      await this.router.navigate(['/']);
      return;
    }
    this.scrollTo('top');
  }

  private isHome(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/' || path === '';
  }

  private syncHeaderSolid(): void {
    if (this.isHome()) {
      this.scrolled.set(
        typeof window !== 'undefined' ? window.scrollY > 40 : false
      );
    } else {
      this.scrolled.set(true);
    }
  }

  private scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
