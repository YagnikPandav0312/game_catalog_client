import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameCardComponent, GameItem } from '../../../shared/components/game-card/game-card.component';
import { ToastService } from '../../../core/services/toast';
import { Home } from '../../../core/services/home';

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
  private readonly homeService = inject(Home);

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

      this.homeService.getHome().subscribe({
        next: (res) => {
          if (res && res.status.code === 0 && res.data) {
            const games = res.data.games || [];
            const categories = res.data.categories || [];

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

              // Map all games with resolved category slugs
              const mappedGames: GameItem[] = games.map((g: any) => {
                // Find matching category for game slug filtering
                const matchedCat = categories.find((c: any) => this.isGameInCategory(g, c.game_categorie_name, c.slug));

                return {
                  id: g.game_id,
                  title: g.game_name,
                  provider: g.provider_name,
                  providerSlug: g.provider_name.toLowerCase().replace(/\s+/g, '-'),
                  image: g.thumbnail,
                  category: g.game_type_name,
                  categorySlug: matchedCat ? matchedCat.slug : '',
                  gameType: g.game_type_name,
                  deviceType: g.device_type_name,
                  isFavorite: false,
                  slug: g.slug
                };
              });

              this.allGames.set(mappedGames);
              this.category.set(info);
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
            }
          }
          this.currentPage.set(1);
          this.searchQuery.set('');
          this.currentSort.set('popularity');
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
