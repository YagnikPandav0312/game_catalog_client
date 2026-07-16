import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameCardComponent, GameItem } from '../../shared/components/game-card/game-card.component';
import { ToastService } from '../../core/services/toast';
import { Games } from '../../core/services/games';
import { Filters } from '../../core/services/filters';
import { Common } from '../../core/services/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-games',
  imports: [CommonModule, GameCardComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss',
})
export class GamesComponent implements OnInit {
  route = inject(ActivatedRoute);
  toastService = inject(ToastService);
  gamesService = inject(Games);
  filtersService = inject(Filters);
  commonService = inject(Common);
  isMobileFiltersOpen = signal(false);

  // Filter States
  searchQuery = signal('');
  selectedProvider = signal('');
  selectedCategory = signal('');
  selectedGameTypes = signal<string[]>([]);
  selectedDevices = signal<string[]>([]);
  currentSort = signal('popularity');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(8);
  sort_by = signal('game_name');
  sort_order = signal('ASC');
  totalRecords = signal(0);

  // Dynamic filter option lookups
  providers = signal<any[]>([]);
  categories = signal<any[]>([]);
  deviceTypes = signal<any[]>([]);

  // Dynamic collections
  allGames = signal<GameItem[]>([]);
  gameTypes = signal<any[]>([]);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
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

  loadAllData(): void {
    this.commonService.showSpinner();
    this.loadGames();
    this.loadFilters();
  }

  fetchGames(): void {
    this.commonService.showSpinner();
    let getPaginationPayload = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order(),
      game_types: this.selectedGameTypes(),
      category: this.selectedCategory(),
      provider: this.selectedProvider(),
      device_types: this.selectedDevices(),
    };
    this.gamesService.getGames(getPaginationPayload).subscribe({
      next: (gamesRes) => {
        if (gamesRes && gamesRes.status && gamesRes.status.code === 0) {
          this.allGames.set(gamesRes.data || []);
          this.totalRecords.set(gamesRes.totalRecords || 0);
        }
        this.commonService.hideSpinner();
      },
      error: (err) => {
        this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load games' });
        this.commonService.hideSpinner();
      },
    });
  }

  loadGames(): void {
    const payload = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order(),
      game_types: this.selectedGameTypes(),
      category: this.selectedCategory(),
      provider: this.selectedProvider(),
      device_types: this.selectedDevices(),
    };

    this.gamesService.getGames(payload).subscribe({
      next: (res: any) => {
        if (res?.status?.code === 0) {
          this.allGames.set(res.data || []);
          this.totalRecords.set(res.totalRecords || 0);
        }

        this.commonService.hideSpinner();
      },
      error: (err) => {
        this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load games' });
        this.commonService.hideSpinner();
      },
    });
  }

  loadFilters(): void {
    this.filtersService.getFilters().subscribe({
      next: (res: any) => {
        if (res && res?.status?.code === 0) {
          // const data = res.data || {};
          // Providers
          this.providers.set(res.data.providers);
          //   (data.providers || []).map((p: any) => ({
          //     id: p.provider_id,
          //     name: p.provider_name,
          //     slug: p.slug || (p.provider_name || '').toLowerCase().replace(/[\s&]+/g, '-'),
          //   })),
          // );
          // Categories
          this.categories.set(res.data.categories);
          //   (data.categories || []).map((c: any) => ({
          //     id: c.game_categorie_id,
          //     name: c.game_categorie_name,
          //     slug: c.slug || (c.game_categorie_name || '').toLowerCase().replace(/[\s&]+/g, '-'),
          //   })),
          // );
          // Game Types
          this.gameTypes.set(res.data.game_types);
          // (data.game_types || []).map((gt: any) => gt.game_type_name));
          // Device Types
          this.deviceTypes.set(res.data.device_types);
          // (data.device_types || []).map((dt: any) => dt.device_type_name));
        }
      },
      error: (err) => {
        this.commonService.manageStatus(
          err.status || { code: 2, message: 'Failed to load filters' },
        );
      },
    });
  }

  filteredGames = computed(() => {
    return this.allGames();
  });

  paginatedGames = computed(() => {
    return this.filteredGames();
  });

  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.resetPagination();
    this.fetchGames();
  }

  onProviderChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProvider.set(target.value);
    this.resetPagination();
    this.fetchGames();
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value);
    this.resetPagination();
    this.fetchGames();
  }

  toggleGameType(type: string): void {
    this.selectedGameTypes.update((current) => {
      if (current.includes(type)) {
        return current.filter((t) => t !== type);
      } else {
        return [...current, type];
      }
    });
    this.resetPagination();
    this.fetchGames();
  }

  toggleDevice(device: string): void {
    this.selectedDevices.update((current) => {
      if (current.includes(device)) {
        return current.filter((d) => d !== device);
      } else {
        return [...current, device];
      }
    });
    this.resetPagination();
    this.fetchGames();
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.currentSort.set(target.value);
    if (target.value === 'az') {
      this.sort_by.set('game_name');
      this.sort_order.set('ASC');
    } else if (target.value === 'za') {
      this.sort_by.set('game_name');
      this.sort_order.set('DESC');
    } else {
      this.sort_by.set('');
      this.sort_order.set('');
    }
    this.fetchGames();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.fetchGames();
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedProvider.set('');
    this.selectedCategory.set('');
    this.selectedGameTypes.set([]);
    this.selectedDevices.set([]);
    this.currentSort.set('popularity');
    this.sort_by.set('');
    this.sort_order.set('');
    this.resetPagination();
    this.fetchGames();
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersOpen.update((v) => !v);
  }

  resetPagination(): void {
    this.pageSize.set(8);
  }

  onFavoriteToggled(game: GameItem): void {
    this.allGames.update((games) =>
      games.map((g) => (g.game_id === game.game_id ? { ...g, isFavorite: !g.isFavorite } : g)),
    );

    const targetGame = this.allGames().find((g) => g.game_id === game.game_id);
    if (targetGame) {
      if (targetGame.isFavorite) {
        this.toastService.success(`Added ${game.game_name} to Favorites!`);
      } else {
        this.toastService.info(`Removed ${game.game_name} from Favorites`);
      }
    }
  }

  onPlayClicked(game: GameItem): void {
    this.toastService.success(`Launching game: ${game.game_name}...`);
  }
}
