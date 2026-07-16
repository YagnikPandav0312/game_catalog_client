import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Providers } from '../../../core/services/providers';
import { Games } from '../../../core/services/games';
import { Common } from '../../../core/services/common';

export interface ProviderDetail {
  name: string;
  logo: string;
  slug: string;
  description: string;
  gameCount: number;
  avgRtp: string;
  volatility: string;
}

export interface GameItem {
  game_id: number;
  title: string;
  provider: string;
  providerSlug: string;
  image: string;
  category: string;
  slug: string;
}

@Component({
  selector: 'app-provider-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './provider-detail.component.html',
  styleUrl: './provider-detail.component.scss'
})
export class ProviderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly providersService = inject(Providers);
  private readonly gamesService = inject(Games);
  private readonly commonService = inject(Common);

  readonly provider = signal<ProviderDetail | null>(null);
  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 6; // paginating games

  readonly allGames = signal<GameItem[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      this.commonService.showSpinner();

      this.providersService.getProviders().subscribe({
        next: (provRes) => {
          if (provRes && provRes.status && provRes.status.code === 0 && provRes.data) {
            const providers = provRes.data || [];
            const dbProvider = providers.find((p: any) => p.slug === slug);

            if (dbProvider) {
              this.gamesService.getGames({ provider: slug }).subscribe({
                next: (gamesRes) => {
                  if (gamesRes && gamesRes.status && gamesRes.status.code === 0 && gamesRes.data) {
                    const providerGamesList = gamesRes.data || [];

                    // Calculate dynamic Avg RTP
                    let avgRtpVal = 96.50;
                    if (providerGamesList.length > 0) {
                      const totalRtp = providerGamesList.reduce((acc: number, g: any) => acc + parseFloat(g.rtp || '96.5'), 0);
                      avgRtpVal = totalRtp / providerGamesList.length;
                    }

                    const info: ProviderDetail = {
                      name: dbProvider.provider_name,
                      logo: dbProvider.logo,
                      slug: dbProvider.slug,
                      description: dbProvider.description || `${dbProvider.provider_name} is a leading game developer providing player-favourites to online gaming catalog.`,
                      gameCount: providerGamesList.length,
                      avgRtp: `${avgRtpVal.toFixed(2)}%`,
                      volatility: 'HIGH'
                    };

                    // Map all games for internal state
                    const mappedGames: GameItem[] = providerGamesList.map((g: any) => ({
                      id: g.game_id,
                      title: g.game_name,
                      provider: g.provider_name,
                      providerSlug: slug,
                      image: g.thumbnail,
                      category: g.game_type_name,
                      slug: g.slug
                    }));

                    this.allGames.set(mappedGames);
                    this.provider.set(info);
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
              const fallbackInfo: ProviderDetail = {
                name: slug.replace(/-/g, ' ').toUpperCase(),
                logo: 'fas fa-dice text-light',
                slug: slug,
                description: 'Premium gaming content developer supplying slots and table releases globally.',
                gameCount: 0,
                avgRtp: '96.10%',
                volatility: 'HIGH'
              };
              this.provider.set(fallbackInfo);
              this.allGames.set([]);
              this.commonService.hideSpinner();
            }
          } else {
            if (provRes && provRes.status) {
              this.commonService.manageStatus(provRes.status);
            }
            this.commonService.hideSpinner();
          }
          this.currentPage.set(1);
          this.searchQuery.set('');
        },
        error: (err) => {
          this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load providers data' });
          this.commonService.hideSpinner();
        }
      });
    });
  }

  readonly providerGames = computed(() => {
    const currentProvider = this.provider();
    if (!currentProvider) return [];
    return this.allGames().filter(g => g.providerSlug === currentProvider.slug);
  });

  readonly filteredGames = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.providerGames();
    return this.providerGames().filter(g => g.title.toLowerCase().includes(query));
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
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
