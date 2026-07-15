import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Home } from '../../../core/services/home';

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
  id: number;
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
  private readonly homeService = inject(Home);

  readonly provider = signal<ProviderDetail | null>(null);
  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 6; // paginating games

  readonly allGames = signal<GameItem[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';

      this.homeService.getHome().subscribe({
        next: (res) => {
          if (res && res.status.code === 0 && res.data) {
            const games = res.data.games || [];
            const providers = res.data.providers || [];

            // Find matching provider
            const dbProvider = providers.find((p: any) => p.slug === slug);

            if (dbProvider) {
              // Get games by this provider
              const providerGamesList = games.filter((g: any) => g.provider_name === dbProvider.provider_name);

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
              const mappedGames: GameItem[] = games.map((g: any) => ({
                id: g.game_id,
                title: g.game_name,
                provider: g.provider_name,
                providerSlug: g.provider_name.toLowerCase().replace(/\s+/g, '-'),
                image: g.thumbnail,
                category: g.game_type_name,
                slug: g.slug
              }));

              this.allGames.set(mappedGames);
              this.provider.set(info);
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
            }
          }
          this.currentPage.set(1);
          this.searchQuery.set('');
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
