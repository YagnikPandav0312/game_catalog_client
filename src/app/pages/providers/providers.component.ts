import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderCardComponent, ProviderItem } from '../../shared/components/provider-card/provider-card.component';
import { Providers } from '../../core/services/providers';
import { Games } from '../../core/services/games';
import { Common } from '../../core/services/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-providers',
  imports: [CommonModule, ProviderCardComponent],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss'
})
export class ProvidersComponent implements OnInit {
  private readonly providersService = inject(Providers);
  private readonly gamesService = inject(Games);
  private readonly commonService = inject(Common);

  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 8; // Number of items per page

  readonly allProviders = signal<ProviderItem[]>([]);

  ngOnInit(): void {
    this.commonService.showSpinner();
    forkJoin({
      providersRes: this.providersService.getProviders(),
      gamesRes: this.gamesService.getGames()
    }).subscribe({
      next: ({ providersRes, gamesRes }) => {
        if (providersRes && providersRes.status && providersRes.status.code === 0) {
          const providers = providersRes.data || [];
          const games = (gamesRes && gamesRes.status && gamesRes.status.code === 0) ? (gamesRes.data || []) : [];

          const mappedProviders = providers.map((p: any) => ({
            id: p.provider_id,
            name: p.provider_name,
            slug: p.slug,
            logo: p.logo,
            gameCount: games.filter((g: any) => g.provider_name === p.provider_name).length
          }));

          this.allProviders.set(mappedProviders);
        } else if (providersRes && providersRes.status) {
          this.commonService.manageStatus(providersRes.status);
        }
        this.commonService.hideSpinner();
      },
      error: (err) => {
        this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load providers data' });
        this.commonService.hideSpinner();
      }
    });
  }

  readonly filteredProviders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allProviders();
    return this.allProviders().filter(p => p.name.toLowerCase().includes(query));
  });

  readonly paginatedProviders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProviders().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredProviders().length / this.pageSize);
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
    this.currentPage.set(1); // Reset to first page when search query changes
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
