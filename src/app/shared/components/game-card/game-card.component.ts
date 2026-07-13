import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface GameItem {
  id: number;
  title: string;
  provider: string;
  providerSlug: string;
  image: string;
  category: string;
  categorySlug: string;
  gameType: string;
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
