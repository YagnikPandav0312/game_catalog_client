import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

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

  readonly game = signal<GameDetails | null>(null);

  // Mock list of all detailed games
  private readonly allGames = signal<GameDetails[]>([
    {
      id: 101,
      title: 'Sweet Bonanza',
      provider: 'Pragmatic Play',
      providerSlug: 'pragmatic-play',
      image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&q=80',
      category: 'Slots',
      categorySlug: 'slots',
      gameType: 'Slots',
      deviceType: 'Universal',
      rtp: '96.48%',
      volatility: 'HIGH',
      releaseDate: '2019-06-27',
      minBet: '₹20.00',
      maxBet: '₹10,000.00',
      isFavorite: false,
      slug: 'sweet-bonanza'
    },
    {
      id: 102,
      title: 'Gates of Olympus',
      provider: 'Pragmatic Play',
      providerSlug: 'pragmatic-play',
      image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&q=80',
      category: 'Slots',
      categorySlug: 'slots',
      gameType: 'Slots',
      deviceType: 'Universal',
      rtp: '96.50%',
      volatility: 'HIGH',
      releaseDate: '2021-02-13',
      minBet: '₹20.00',
      maxBet: '₹12,500.00',
      isFavorite: false,
      slug: 'gates-of-olympus'
    },
    {
      id: 103,
      title: 'The Dog House',
      provider: 'Pragmatic Play',
      providerSlug: 'pragmatic-play',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
      category: 'Slots',
      categorySlug: 'slots',
      gameType: 'Slots',
      deviceType: 'Universal',
      rtp: '96.51%',
      volatility: 'HIGH',
      releaseDate: '2020-08-14',
      minBet: '₹10.00',
      maxBet: '₹8,000.00',
      isFavorite: false,
      slug: 'the-dog-house-megaways'
    },
    {
      id: 108,
      title: 'Starburst',
      provider: 'NetEnt',
      providerSlug: 'netent',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
      category: 'Slots',
      categorySlug: 'slots',
      gameType: 'Slots',
      deviceType: 'Universal',
      rtp: '96.09%',
      volatility: 'LOW',
      releaseDate: '2012-11-12',
      minBet: '₹10.00',
      maxBet: '₹10,000.00',
      isFavorite: false,
      slug: 'starburst'
    }
  ]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      const foundGame = this.allGames().find(g => g.slug === slug);
      if (foundGame) {
        this.game.set(foundGame);
      } else {
        this.game.set({
          id: 999,
          title: slug.replace(/-/g, ' ').toUpperCase(),
          provider: 'Pragmatic Play',
          providerSlug: 'pragmatic-play',
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
          category: 'Slots',
          categorySlug: 'slots',
          gameType: 'Slots',
          deviceType: 'Universal',
          rtp: '96.25%',
          volatility: 'HIGH',
          releaseDate: '2025-01-10',
          minBet: '₹20.00',
          maxBet: '₹10,000.00',
          isFavorite: false,
          slug: slug
        });
      }
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
