import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { MenuComponent } from './components/menu/menu.component';
import { PromoComponent } from './components/promo/promo.component';
import { ExploreComponent } from './components/explore/explore.component';
import { StoryComponent } from './components/story/story.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { WhatsappFloatComponent } from './components/whatsapp-float/whatsapp-float.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    HeroComponent,
    MenuComponent,
    PromoComponent,
    ExploreComponent,
    StoryComponent,
    FooterComponent,
    CartDrawerComponent,
    WhatsappFloatComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
