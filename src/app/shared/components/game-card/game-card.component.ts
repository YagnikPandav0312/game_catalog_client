import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface GameItem {
  game_id: number;
  game_name: string;
  provider_name: string;
  providerSlug?: string;
  thumbnail: string;
  category?: string;
  categorySlug?: string;
  game_type_name: string;
  deviceType: string;
  isFavorite: boolean;
  slug: string;
}

@Component({
  selector: 'app-game-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {

  @Input({ required: true }) game!: GameItem;
  @Output() favoriteToggled = new EventEmitter<GameItem>();
  @Output() playClicked = new EventEmitter<GameItem>();

  onFavorite(event: Event): void {
    event.stopPropagation();
    this.favoriteToggled.emit(this.game);
  }

  onPlay(event: Event): void {
    event.stopPropagation();
    this.playClicked.emit(this.game);
  }
}
