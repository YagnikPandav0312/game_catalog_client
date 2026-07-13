import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameCardComponent, GameItem } from '../../shared/components/game-card/game-card.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-games',
  imports: [CommonModule, GameCardComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss'
})
export class GamesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly isMobileFiltersOpen = signal(false);
  readonly isLoadingMore = signal(false);
  
  // Filter States
  readonly searchQuery = signal('');
  readonly selectedProvider = signal('');
  readonly selectedCategory = signal('');
  readonly selectedGameTypes = signal<string[]>([]);
  readonly selectedDevices = signal<string[]>([]);
  readonly currentSort = signal('popularity');
  
  // Pagination State
  readonly itemsLimit = signal(8); // load first 8 games

  // Static filter option lookups
  readonly providers = signal([
    { id: 1, name: 'Pragmatic Play', slug: 'pragmatic-play' },
    { id: 2, name: 'Evolution Gaming', slug: 'evolution' },
    { id: 3, name: 'PG Soft', slug: 'pg-soft' },
    { id: 4, name: 'NetEnt', slug: 'netent' },
    { id: 5, name: 'Play\'n GO', slug: 'play-n-go' },
    { id: 6, name: 'Hacksaw Gaming', slug: 'hacksaw-gaming' }
  ]);

  readonly categories = signal([
    { id: 1, name: 'Slots', slug: 'slots' },
    { id: 2, name: 'Live Casino', slug: 'live-casino' },
    { id: 3, name: 'Table Games', slug: 'table-games' },
    { id: 4, name: 'Instant Games', slug: 'instant-games' }
  ]);

  readonly gameTypes = signal(['Slots', 'Live Roulette', 'Live Blackjack', 'Live Game Show', 'Baccarat', 'Crash Games']);
  readonly deviceTypes = signal(['Desktop', 'Mobile', 'Tablet']);

  // Large collection of mock games
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
    { id: 20, title: 'Spaceman', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', category: 'Instant Games', categorySlug: 'instant-games', gameType: 'Crash Games', deviceType: 'Universal', isFavorite: false, slug: 'spaceman' }
  ]);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['provider']) {
        this.selectedProvider.set(params['provider']);
      }
      if (params['filter'] === 'new') {
        this.searchQuery.set('Zeus');
      }
    });
  }

  readonly filteredGames = computed(() => {
    let result = this.allGames();
    
    const search = this.searchQuery().toLowerCase().trim();
    if (search) {
      result = result.filter(g => g.title.toLowerCase().includes(search));
    }
    
    const provider = this.selectedProvider();
    if (provider) {
      result = result.filter(g => g.providerSlug === provider);
    }
    
    const category = this.selectedCategory();
    if (category) {
      result = result.filter(g => g.categorySlug === category);
    }
    
    const types = this.selectedGameTypes();
    if (types.length > 0) {
      result = result.filter(g => types.includes(g.gameType));
    }
    
    const devices = this.selectedDevices();
    if (devices.length > 0) {
      result = result.filter(g => devices.includes(g.deviceType) || g.deviceType === 'Universal');
    }
    
    const sort = this.currentSort();
    if (sort === 'az') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'za') {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }
    
    return result;
  });

  readonly paginatedGames = computed(() => {
    return this.filteredGames().slice(0, this.itemsLimit());
  });

  readonly hasMoreItems = computed(() => {
    return this.itemsLimit() < this.filteredGames().length;
  });

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.resetPagination();
  }

  onProviderChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProvider.set(target.value);
    this.resetPagination();
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value);
    this.resetPagination();
  }

  toggleGameType(type: string): void {
    this.selectedGameTypes.update(current => {
      if (current.includes(type)) {
        return current.filter(t => t !== type);
      } else {
        return [...current, type];
      }
    });
    this.resetPagination();
  }

  toggleDevice(device: string): void {
    this.selectedDevices.update(current => {
      if (current.includes(device)) {
        return current.filter(d => d !== device);
      } else {
        return [...current, device];
      }
    });
    this.resetPagination();
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.currentSort.set(target.value);
  }

  loadMore(): void {
    this.isLoadingMore.set(true);
    setTimeout(() => {
      this.itemsLimit.update(current => current + 8);
      this.isLoadingMore.set(false);
    }, 600);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedProvider.set('');
    this.selectedCategory.set('');
    this.selectedGameTypes.set([]);
    this.selectedDevices.set([]);
    this.currentSort.set('popularity');
    this.resetPagination();
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersOpen.update(v => !v);
  }

  private resetPagination(): void {
    this.itemsLimit.set(8);
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
