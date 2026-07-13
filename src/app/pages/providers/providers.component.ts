import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderCardComponent, ProviderItem } from '../../shared/components/provider-card/provider-card.component';

@Component({
  selector: 'app-providers',
  imports: [CommonModule, ProviderCardComponent],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss'
})
export class ProvidersComponent {
  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 8; // Number of items per page

  readonly allProviders = signal<ProviderItem[]>([
    { id: 1, name: 'Pragmatic Play', logo: 'fas fa-gamepad text-danger', slug: 'pragmatic-play', gameCount: 154 },
    { id: 2, name: 'Evolution Gaming', logo: 'fas fa-video text-warning', slug: 'evolution', gameCount: 42 },
    { id: 3, name: 'PG Soft', logo: 'fas fa-mobile-alt text-primary', slug: 'pg-soft', gameCount: 88 },
    { id: 4, name: 'NetEnt', logo: 'fas fa-cube text-success', slug: 'netent', gameCount: 110 },
    { id: 5, name: 'Play\'n GO', logo: 'fas fa-play-circle text-info', slug: 'play-n-go', gameCount: 95 },
    { id: 6, name: 'Hacksaw Gaming', logo: 'fas fa-dice text-light', slug: 'hacksaw-gaming', gameCount: 36 },
    { id: 7, name: 'Yggdrasil', logo: 'fas fa-tree text-warning', slug: 'yggdrasil', gameCount: 64 },
    { id: 8, name: 'Spribe', logo: 'fas fa-paper-plane text-danger', slug: 'spribe', gameCount: 12 },
    { id: 9, name: 'Nolimit City', logo: 'fas fa-skull text-warning', slug: 'nolimit-city', gameCount: 50 },
    { id: 10, name: 'Relax Gaming', logo: 'fas fa-couch text-info', slug: 'relax-gaming', gameCount: 78 },
    { id: 11, name: 'Push Gaming', logo: 'fas fa-gem text-success', slug: 'push-gaming', gameCount: 29 },
    { id: 12, name: 'Quickspin', logo: 'fas fa-wind text-primary', slug: 'quickspin', gameCount: 44 }
  ]);

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
