import { Component } from '@angular/core';
import { SOCIAL_LINKS, WHATSAPP_NUMBER } from '../../data/products';

@Component({
  selector: 'app-story',
  standalone: true,
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
})
export class StoryComponent {
  readonly social = SOCIAL_LINKS;
  readonly whatsappDisplay = WHATSAPP_NUMBER.replace(
    /^(\d{3})(\d{3})(\d{3})(\d+)$/,
    '+$1 $2 $3 $4'
  );
}
