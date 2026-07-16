import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { Games } from '../../../core/services/games';
import { Common } from '../../../core/services/common';

export interface GameDetails {
  id: number;
  title: string;
  provider: string;
  providerSlug: string;
  image: string;
  category: string;
  categorySlug: string;
  gameType: string;
  deviceType: string;
  rtp: string;
  volatility: string;
  releaseDate: string;
  minBet: string;
  maxBet: string;
  isFavorite: boolean;
  slug: string;
}

@Component({
  selector: 'app-game-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss'
})
export class GameDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly gamesService = inject(Games);
  private readonly commonService = inject(Common);

  readonly game = signal<GameDetails | null>(null);

  readonly allGames = signal<GameDetails[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      this.commonService.showSpinner();

      this.gamesService.getGames({ limit: 100 }).subscribe({
        next: (res) => {
          if (res && res.status && res.status.code === 0 && res.data) {
            const gamesList = res.data || [];

            // Map all games from the database to GameDetails format
            const mappedGames: GameDetails[] = gamesList.map((g: any) => ({
              id: g.game_id,
              title: g.game_name,
              provider: g.provider_name,
              providerSlug: g.provider_name ? g.provider_name.toLowerCase().replace(/\s+/g, '-') : '',
              image: g.thumbnail,
              category: g.game_type_name || 'Slots',
              categorySlug: g.game_type_name ? g.game_type_name.toLowerCase().replace(/\s+/g, '-') : 'slots',
              gameType: g.game_type_name || 'Slots',
              deviceType: g.device_type_name || 'Universal',
              rtp: g.rtp ? `${parseFloat(g.rtp).toFixed(2)}%` : '96.25%',
              volatility: 'HIGH', // Variance/volatility is defaulted to HIGH
              releaseDate: g.release_date || '2025-01-10',
              minBet: g.min_bet ? `₹${parseFloat(g.min_bet).toLocaleString('en-IN')}` : '₹20.00',
              maxBet: g.max_bet ? `₹${parseFloat(g.max_bet).toLocaleString('en-IN')}` : '₹10,000.00',
              isFavorite: false,
              slug: g.slug
            }));

            this.allGames.set(mappedGames);

            const foundGame = mappedGames.find(g => g.slug === slug);
            if (foundGame) {
              this.game.set(foundGame);
            } else {
              this.game.set(null);
            }
          } else {
            if (res && res.status) {
              this.commonService.manageStatus(res.status);
            }
          }
          this.commonService.hideSpinner();
        },
        error: (err) => {
          this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load games data' });
          this.commonService.hideSpinner();
        }
      });
    });
  }

  readonly relatedGames = computed(() => {
    const currentGame = this.game();
    if (!currentGame) return [];
    return this.allGames().filter(g => g.id !== currentGame.id).slice(0, 4);
  });

  onPlay(): void {
    const currentGame = this.game();
    if (currentGame) {
      this.toastService.success(`Launching play lobby for: ${currentGame.title}!`);
    }
  }

  onFavoriteToggle(): void {
    const currentGame = this.game();
    if (currentGame) {
      const targetState = !currentGame.isFavorite;
      this.game.update(g => g ? { ...g, isFavorite: targetState } : null);
      
      this.allGames.update(games => 
        games.map(g => g.id === currentGame.id ? { ...g, isFavorite: targetState } : g)
      );

      if (targetState) {
        this.toastService.success(`Added ${currentGame.title} to Favorites!`);
      } else {
        this.toastService.info(`Removed ${currentGame.title} from Favorites`);
      }
    }
  }
}
