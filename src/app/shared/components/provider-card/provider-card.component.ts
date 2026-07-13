import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface ProviderItem {
  id: number;
  name: string;
  logo: string;
  slug: string;
  gameCount?: number;
}

@Component({
  selector: 'app-provider-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './provider-card.component.html',
  styleUrl: './provider-card.component.scss'
})
export class ProviderCardComponent {
  @Input({ required: true }) provider!: ProviderItem;
}
