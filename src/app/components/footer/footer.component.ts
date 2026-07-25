import { Component } from '@angular/core';
import { SOCIAL_LINKS } from '../../data/products';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly social = SOCIAL_LINKS;
}
