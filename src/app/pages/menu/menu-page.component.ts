import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent, MenuFilter } from '../../components/menu/menu.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartDrawerComponent } from '../../components/cart-drawer/cart-drawer.component';
import { WhatsappFloatComponent } from '../../components/whatsapp-float/whatsapp-float.component';
import { CATEGORIES } from '../../data/products';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [
    HeaderComponent,
    MenuComponent,
    FooterComponent,
    CartDrawerComponent,
    WhatsappFloatComponent,
  ],
  templateUrl: './menu-page.component.html',
  styleUrl: './menu-page.component.scss',
})
export class MenuPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly initialFilter = toSignal(
    this.route.queryParamMap.pipe(
      map((params): MenuFilter => {
        const category = params.get('category');
        if (
          category &&
          (CATEGORIES as readonly string[]).includes(category)
        ) {
          return category as MenuFilter;
        }
        return 'All';
      })
    ),
    { initialValue: 'All' as MenuFilter }
  );
}
