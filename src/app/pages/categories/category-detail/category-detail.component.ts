import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameCardComponent, GameItem } from '../../../shared/components/game-card/game-card.component';
import { ToastService } from '../../../core/services/toast.service';

export interface CategoryDetail {
  name: string;
  icon: string;
  slug: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-category-detail',
  imports: [CommonModule, RouterModule, GameCardComponent],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss'
})
export class CategoryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly category = signal<CategoryDetail | null>(null);
  readonly searchQuery = signal<string>('');
  readonly currentSort = signal<string>('popularity');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 8; // Number of games per page

  // Large collection of mock games matching games.component.ts + table games / jackpots
  readonly allGames = signal<GameItem[]>([
    { id: 1, title: 'Sweet Bonanza', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'sweet-bonanza' },
    { id: 2, title: 'Gates of Olympus', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'gates-of-olympus' },
    { id: 3, title: 'The Dog House', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'the-dog-house-megaways' },
    { id: 4, title: 'Wanted Dead or a Wild', provider: 'Hacksaw Gaming', providerSlug: 'hacksaw-gaming', image: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'wanted-dead-or-a-wild' },
    { id: 5, title: 'Sugar Rush', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'sugar-rush' },
    { id: 6, title: 'Book of Dead', provider: 'Play\'n GO', providerSlug: 'play-n-go', image: 'https://images.unsplash.com/photo-1600577916048-804c9191e36c?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'book-of-dead' },
    { id: 7, title: 'Big Bass Splash', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'big-bass-splash' },
    { id: 8, title: 'Starburst', provider: 'NetEnt', providerSlug: 'netent', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'starburst' },
    
    { id: 9, title: 'Lightning Roulette', provider: 'Evolution Gaming', providerSlug: 'evolution', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80', category: 'Live Casino', categorySlug: 'live-casino', gameType: 'Live Roulette', deviceType: 'Universal', isFavorite: false, slug: 'lightning-roulette' },
    { id: 10, title: 'Crazy Time', provider: 'Evolution Gaming', providerSlug: 'evolution', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80', category: 'Live Casino', categorySlug: 'live-casino', gameType: 'Live Game Show', deviceType: 'Universal', isFavorite: false, slug: 'crazy-time' },
    { id: 11, title: 'Infinite Blackjack', provider: 'Evolution Gaming', providerSlug: 'evolution', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', category: 'Live Casino', categorySlug: 'live-casino', gameType: 'Live Blackjack', deviceType: 'Universal', isFavorite: false, slug: 'infinite-blackjack' },
    
    { id: 12, title: 'Floating Dragon', provider: 'PG Soft', providerSlug: 'pg-soft', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Mobile', isFavorite: false, slug: 'floating-dragon' },
    { id: 13, title: 'Mummyland Treasures', provider: 'Relax Gaming', providerSlug: 'relax-gaming', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Desktop', isFavorite: false, slug: 'mummyland-treasures' },
    { id: 14, title: 'Joker\'s Jewels', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'jokers-jewels' },
    { id: 15, title: 'Wild West Gold', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'wild-west-gold' },
    { id: 16, title: 'Buffalo King Megaways', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'buffalo-king-megaways' },
    { id: 17, title: 'Cash Bonanza', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Desktop', isFavorite: false, slug: 'cash-bonanza' },
    { id: 18, title: 'Rise of Olympus', provider: 'Play\'n GO', providerSlug: 'play-n-go', image: 'https://images.unsplash.com/photo-1549880180-850d700c5945?w=400&q=80', category: 'Slots', categorySlug: 'slots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'rise-of-olympus' },
    
    { id: 19, title: 'Aviator', provider: 'Spribe', providerSlug: 'spribe', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80', category: 'Instant Games', categorySlug: 'instant-games', gameType: 'Crash Games', deviceType: 'Mobile', isFavorite: false, slug: 'aviator' },
    { id: 20, title: 'Spaceman', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', category: 'Instant Games', categorySlug: 'instant-games', gameType: 'Crash Games', deviceType: 'Universal', isFavorite: false, slug: 'spaceman' },

    // Table Games
    { id: 21, title: 'Multihand Blackjack', provider: 'PG Soft', providerSlug: 'pg-soft', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', category: 'Table Games', categorySlug: 'table-games', gameType: 'Live Blackjack', deviceType: 'Mobile', isFavorite: false, slug: 'multihand-blackjack' },
    { id: 22, title: 'European Roulette', provider: 'NetEnt', providerSlug: 'netent', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80', category: 'Table Games', categorySlug: 'table-games', gameType: 'Live Roulette', deviceType: 'Universal', isFavorite: false, slug: 'european-roulette' },
    { id: 23, title: 'Baccarat Pro', provider: 'NetEnt', providerSlug: 'netent', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80', category: 'Table Games', categorySlug: 'table-games', gameType: 'Baccarat', deviceType: 'Universal', isFavorite: false, slug: 'baccarat-pro' },

    // Jackpots
    { id: 24, title: 'Mega Moolah', provider: 'Quickspin', providerSlug: 'quickspin', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=400&q=80', category: 'Jackpots', categorySlug: 'jackpots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'mega-moolah' },
    { id: 25, title: 'Hall of Gods', provider: 'NetEnt', providerSlug: 'netent', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', category: 'Jackpots', categorySlug: 'jackpots', gameType: 'Slots', deviceType: 'Universal', isFavorite: false, slug: 'hall-of-gods' }
  ]);

  private readonly categoriesInfo: Record<string, CategoryDetail> = {
    'slots': {
      name: 'Slots',
      icon: 'fas fa-dharmachakra',
      slug: 'slots',
      color: '#ff007f',
      description: 'Spin to win in thousands of slots with unique features, free spins, and megaways.'
    },
    'live-casino': {
      name: 'Live Casino',
      icon: 'fas fa-microphone',
      slug: 'live-casino',
      color: '#8c52ff',
      description: 'Experience the real casino action with live dealers in real-time streaming.'
    },
    'table-games': {
      name: 'Table Games',
      icon: 'fas fa-dice-five',
      slug: 'table-games',
      color: '#00e676',
      description: 'Test your strategy on classic games like Blackjack, Roulette, and Baccarat.'
    },
    'instant-games': {
      name: 'Instant Games',
      icon: 'fas fa-bolt',
      slug: 'instant-games',
      color: '#ffd600',
      description: 'Fast-paced crash games, mines, and plinko for instant big payouts.'
    },
    'jackpots': {
      name: 'Jackpots',
      icon: 'fas fa-trophy',
      slug: 'jackpots',
      color: '#2979ff',
      description: 'Play for massive prize pools and life-changing jackpot payouts.'
    }
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      const info = this.categoriesInfo[slug] || {
        name: slug.replace(/-/g, ' ').toUpperCase(),
        icon: 'fas fa-dice text-light',
        slug: slug,
        color: '#8c52ff',
        description: 'Explore premium catalog of games curated specifically for you.'
      };
      this.category.set(info);
      this.currentPage.set(1);
      this.searchQuery.set('');
      this.currentSort.set('popularity');
    });
  }

  readonly categoryGames = computed(() => {
    const currentCategory = this.category();
    if (!currentCategory) return [];
    return this.allGames().filter(g => g.categorySlug === currentCategory.slug);
  });

  readonly filteredGames = computed(() => {
    let result = this.categoryGames();

    // Search query filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(g => g.title.toLowerCase().includes(query));
    }

    // Sort order
    const sort = this.currentSort();
    if (sort === 'az') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'za') {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  });

  readonly paginatedGames = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredGames().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredGames().length / this.pageSize);
  });

  readonly pageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.currentPage.set(1); // Reset to page 1 on search change
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.currentSort.set(target.value);
    this.currentPage.set(1); // Reset to page 1 on sort change
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onFavoriteToggled(game: GameItem): void {
    this.allGames.update(games =>
      games.map(g => g.id === game.id ? { ...g, isFavorite: !g.isFavorite } : g)
    );

    const targetGame = this.allGames().find(g => g.id === game.id);
    if (targetGame) {
      if (targetGame.isFavorite) {
        this.toastService.success(`Added ${game.title} to Favorites!`);
      } else {
        this.toastService.info(`Removed ${game.title} from Favorites`);
      }
    }
  }

  onPlayClicked(game: GameItem): void {
    this.toastService.success(`Launching game: ${game.title}...`);
  }
}
