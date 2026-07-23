import { Component } from '@angular/core';
import { WHATSAPP_NUMBER } from '../../data/products';

@Component({
  selector: 'app-story',
  standalone: true,
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
})
export class StoryComponent {
  /** Display version of the shared WhatsApp number, e.g. +254 712 345 678 */
  readonly whatsappDisplay = WHATSAPP_NUMBER.replace(
    /^(\d{3})(\d{3})(\d{3})(\d+)$/,
    '+$1 $2 $3 $4'
  );
}
