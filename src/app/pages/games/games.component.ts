import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameCardComponent, GameItem } from '../../shared/components/game-card/game-card.component';
import { ToastService } from '../../core/services/toast';
import { Games } from '../../core/services/games';
import { Providers } from '../../core/services/providers';
import { Categories } from '../../core/services/categories';
import { Common } from '../../core/services/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-games',
  imports: [CommonModule, GameCardComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss'
})
export class GamesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly gamesService = inject(Games);
  private readonly providersService = inject(Providers);
  private readonly categoriesService = inject(Categories);
  private readonly commonService = inject(Common);

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

  // Dynamic filter option lookups
  readonly providers = signal<any[]>([]);
  readonly categories = signal<any[]>([]);
  readonly deviceTypes = signal(['Desktop', 'Mobile', 'Tablet']);

  // Dynamic collections
  readonly allGames = signal<GameItem[]>([]);

  readonly gameTypes = computed(() => {
    const types = new Set(this.allGames().map(g => g.gameType));
    return Array.from(types).filter(Boolean);
  });

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

    this.loadAllData();
  }

  private loadAllData(): void {
    this.commonService.showSpinner();
    forkJoin({
      gamesRes: this.gamesService.getGames(),
      providersRes: this.providersService.getProviders(),
      categoriesRes: this.categoriesService.getCategories()
    }).subscribe({
      next: ({ gamesRes, providersRes, categoriesRes }) => {
        // Load games
        if (gamesRes && gamesRes.status && gamesRes.status.code === 0) {
          const games = gamesRes.data || [];
          const mappedGames: GameItem[] = games.map((g: any) => {
            const categoryInfo = this.getGameCategory(g.game_type_name);
            let deviceType = 'Universal';
            const devName = (g.device_type_name || '').toLowerCase();
            if (devName.includes('mobile') || devName.includes('phone')) {
              deviceType = 'Mobile';
            } else if (devName.includes('tablet') || devName.includes('ipad')) {
              deviceType = 'Tablet';
            } else if (devName.includes('desktop') || devName.includes('pc')) {
              deviceType = 'Desktop';
            }

            return {
              id: g.game_id,
              title: g.game_name,
              provider: g.provider_name,
              providerSlug: (g.provider_name || '').toLowerCase().replace(/[\s&]+/g, '-'),
              image: g.thumbnail || 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80',
              category: categoryInfo.name,
              categorySlug: categoryInfo.slug,
              gameType: g.game_type_name || 'Slots',
              deviceType: deviceType,
              isFavorite: false,
              slug: g.slug || (g.game_name || '').toLowerCase().replace(/[\s&]+/g, '-')
            };
          });
          this.allGames.set(mappedGames);
        }

        // Load providers
        if (providersRes && providersRes.status && providersRes.status.code === 0) {
          const providers = providersRes.data || [];
          const mappedProviders = providers.map((p: any) => ({
            id: p.provider_id,
            name: p.provider_name,
            slug: p.slug || (p.provider_name || '').toLowerCase().replace(/[\s&]+/g, '-')
          }));
          this.providers.set(mappedProviders);
        }

        // Load categories
        if (categoriesRes && categoriesRes.status && categoriesRes.status.code === 0) {
          const categories = categoriesRes.data || [];
          const mappedCategories = categories.map((c: any) => ({
            id: c.game_categorie_id,
            name: c.game_categorie_name,
            slug: c.slug || (c.game_categorie_name || '').toLowerCase().replace(/[\s&]+/g, '-')
          }));
          this.categories.set(mappedCategories);
        }

        this.commonService.hideSpinner();
      },
      error: (err) => {
        this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load games data' });
        this.commonService.hideSpinner();
      }
    });
  }

  private getGameCategory(gameTypeName: string): { name: string, slug: string } {
    const typeName = (gameTypeName || '').toLowerCase();
    if (typeName.includes('slot')) {
      return { name: 'Slots', slug: 'slots' };
    }
    if (typeName.includes('live') || typeName.includes('show')) {
      return { name: 'Live Casino', slug: 'live-casino' };
    }
    if (typeName.includes('baccarat')) {
      return { name: 'Baccarat', slug: 'baccarat' };
    }
    if (typeName.includes('crash')) {
      return { name: 'Instant Games', slug: 'instant-games' };
    }
    if (typeName.includes('roulette') || typeName.includes('blackjack') || typeName.includes('baccarat')) {
      return { name: 'Table Games', slug: 'table-games' };
    }
    return { name: 'Slots', slug: 'slots' }; // Default fallback
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
