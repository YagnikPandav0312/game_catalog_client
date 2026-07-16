import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameCardComponent, GameItem } from '../../../shared/components/game-card/game-card.component';
import { ToastService } from '../../../core/services/toast';
import { Categories } from '../../../core/services/categories';
import { Games } from '../../../core/services/games';
import { Common } from '../../../core/services/common';

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
  private readonly categoriesService = inject(Categories);
  private readonly gamesService = inject(Games);
  private readonly commonService = inject(Common);

  readonly category = signal<CategoryDetail | null>(null);
  readonly searchQuery = signal<string>('');
  readonly currentSort = signal<string>('popularity');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 8; // Number of games per page

  readonly allGames = signal<GameItem[]>([]);

  private readonly categoryStyles: Record<string, { color: string, icon: string, description: string }> = {
    'slots': {
      color: '#ff007f',
      icon: 'fas fa-dharmachakra',
      description: 'Spin to win in thousands of slots with unique features, free spins, and megaways.'
    },
    'live-casino': {
      color: '#8c52ff',
      icon: 'fas fa-microphone',
      description: 'Experience the real casino action with live dealers in real-time streaming.'
    },
    'table-games': {
      color: '#00e676',
      icon: 'fas fa-dice-five',
      description: 'Test your strategy on classic games like Blackjack, Roulette, and Baccarat.'
    },
    'instant-games': {
      color: '#ffd600',
      icon: 'fas fa-bolt',
      description: 'Fast-paced crash games, mines, and plinko for instant big payouts.'
    },
    'jackpots': {
      color: '#2979ff',
      icon: 'fas fa-trophy',
      description: 'Play for massive prize pools and life-changing jackpot payouts.'
    },
    'baccarat': {
      color: '#ff5722',
      icon: 'fas fa-id-card',
      description: 'Sleek baccarat cards action with standard, squeeze and speed options.'
    },
    'crash-games': {
      color: '#ffd600',
      icon: 'fas fa-plane-departure',
      description: 'Exciting crash games. Watch the multiplier rise and cash out before the crash!'
    }
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      this.commonService.showSpinner();

      this.categoriesService.getCategories().subscribe({
        next: (catRes) => {
          if (catRes && catRes.status && catRes.status.code === 0 && catRes.data) {
            const categories = catRes.data || [];
            // Find matching category
            const dbCategory = categories.find((c: any) => c.slug === slug);

            if (dbCategory) {
              const styles = this.categoryStyles[dbCategory.slug] || {
                color: '#8c52ff',
                icon: 'fas fa-dice text-light',
                description: 'Explore premium catalog of games curated specifically for you.'
              };

              const info: CategoryDetail = {
                name: dbCategory.game_categorie_name,
                slug: dbCategory.slug,
                icon: styles.icon,
                color: styles.color,
                description: styles.description
              };

              // Fetch games specifically for this category
              this.gamesService.getGames({ category: slug }).subscribe({
                next: (gamesRes) => {
                  if (gamesRes && gamesRes.status && gamesRes.status.code === 0 && gamesRes.data) {
                    const categoryGamesList = gamesRes.data || [];

                    // Map all games with resolved category slugs
                    const mappedGames: GameItem[] = categoryGamesList.map((g: any) => {
                      return {
                        game_id: g.game_id,
                        game_name: g.game_name,
                        provider_name: g.provider_name,
                        providerSlug: g.provider_name.toLowerCase().replace(/\s+/g, '-'),
                        thumbnail: g.thumbnail,
                        category: g.game_type_name,
                        categorySlug: slug,
                        game_type_name: g.game_type_name,
                        deviceType: g.device_type_name,
                        isFavorite: false,
                        slug: g.slug
                      };
                    });

                    this.allGames.set(mappedGames);
                    this.category.set(info);
                  } else {
                    if (gamesRes && gamesRes.status) {
                      this.commonService.manageStatus(gamesRes.status);
                    }
                  }
                  this.commonService.hideSpinner();
                },
                error: (err) => {
                  this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load games data' });
                  this.commonService.hideSpinner();
                }
              });
            } else {
              // Fallback
              const fallbackInfo: CategoryDetail = {
                name: slug.replace(/-/g, ' ').toUpperCase(),
                icon: 'fas fa-dice text-light',
                slug: slug,
                color: '#8c52ff',
                description: 'Explore premium catalog of games curated specifically for you.'
              };
              this.category.set(fallbackInfo);
              this.allGames.set([]);
              this.commonService.hideSpinner();
            }
          } else {
            if (catRes && catRes.status) {
              this.commonService.manageStatus(catRes.status);
            }
            this.commonService.hideSpinner();
          }
          this.currentPage.set(1);
          this.searchQuery.set('');
          this.currentSort.set('popularity');
        },
        error: (err) => {
          this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load categories data' });
          this.commonService.hideSpinner();
        }
      });
    });
  }

  private isGameInCategory(game: any, categoryName: string, categorySlug: string): boolean {
    const typeName = (game.game_type_name || '').toLowerCase();
    const catName = categoryName.toLowerCase();
    const catSlug = categorySlug.toLowerCase();

    if (catSlug === 'slots' || catName.includes('slot')) {
      return typeName.includes('slot');
    }
    if (catSlug === 'live-casino' || catName.includes('live')) {
      return typeName.includes('live') || typeName.includes('show');
    }
    if (catSlug === 'baccarat' || catName.includes('baccarat')) {
      return typeName.includes('baccarat');
    }
    if (catSlug === 'crash-games' || catName.includes('crash')) {
      return typeName.includes('crash');
    }
    if (catSlug === 'table-games' || catName.includes('table')) {
      return typeName.includes('roulette') || typeName.includes('blackjack') || typeName.includes('baccarat');
    }

    return typeName.includes(catName) || catName.includes(typeName);
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
      result = result.filter(g => g.game_name.toLowerCase().includes(query));
    }

    // Sort order
    const sort = this.currentSort();
    if (sort === 'az') {
      result = [...result].sort((a, b) => a.game_name.localeCompare(b.game_name));
    } else if (sort === 'za') {
      result = [...result].sort((a, b) => b.game_name.localeCompare(a.game_name));
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
      games.map(g => g.game_id === game.game_id ? { ...g, isFavorite: !g.isFavorite } : g)
    );

    const targetGame = this.allGames().find(g => g.game_id === game.game_id);
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
