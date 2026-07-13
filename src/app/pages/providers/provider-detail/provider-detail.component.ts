import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

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

  readonly provider = signal<ProviderDetail | null>(null);
  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 6; // paginating games

  // All mock games for filter illustration
  private readonly allGames = signal<GameItem[]>([
    { id: 1, title: 'Sweet Bonanza', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80', category: 'Slots', slug: 'sweet-bonanza' },
    { id: 2, title: 'Gates of Olympus', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80', category: 'Slots', slug: 'gates-of-olympus' },
    { id: 3, title: 'The Dog House', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', category: 'Slots', slug: 'the-dog-house-megaways' },
    { id: 4, title: 'Sugar Rush', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80', category: 'Slots', slug: 'sugar-rush' },
    { id: 5, title: 'Joker\'s Jewels', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80', category: 'Slots', slug: 'jokers-jewels' },
    { id: 6, title: 'Wild West Gold', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=400&q=80', category: 'Slots', slug: 'wild-west-gold' },
    { id: 7, title: 'Buffalo King Megaways', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', category: 'Slots', slug: 'buffalo-king-megaways' },
    { id: 8, title: 'Cash Bonanza', provider: 'Pragmatic Play', providerSlug: 'pragmatic-play', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80', category: 'Slots', slug: 'cash-bonanza' },
    
    { id: 21, title: 'Lightning Roulette', provider: 'Evolution Gaming', providerSlug: 'evolution', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80', category: 'Live Casino', slug: 'lightning-roulette' },
    { id: 22, title: 'Crazy Time', provider: 'Evolution Gaming', providerSlug: 'evolution', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80', category: 'Live Casino', slug: 'crazy-time' },
    
    { id: 31, title: 'Floating Dragon', provider: 'PG Soft', providerSlug: 'pg-soft', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80', category: 'Slots', slug: 'floating-dragon' },
    
    { id: 41, title: 'Starburst', provider: 'NetEnt', providerSlug: 'netent', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', category: 'Slots', slug: 'starburst' }
  ]);

  private readonly providersInfo: Record<string, ProviderDetail> = {
    'pragmatic-play': {
      name: 'Pragmatic Play',
      logo: 'fas fa-gamepad text-danger',
      slug: 'pragmatic-play',
      description: 'Pragmatic Play is a leading game developer providing player-favourites to the most successful global brands in the iGaming industry.',
      gameCount: 250,
      avgRtp: '96.50%',
      volatility: 'HIGH'
    },
    'evolution': {
      name: 'Evolution Gaming',
      logo: 'fas fa-video text-warning',
      slug: 'evolution',
      description: 'Evolution Gaming is the world leader in video-streamed Live Dealer gaming, working with more top-tier operators than any other provider.',
      gameCount: 85,
      avgRtp: '97.20%',
      volatility: 'MEDIUM'
    },
    'pg-soft': {
      name: 'PG Soft',
      logo: 'fas fa-mobile-alt text-primary',
      slug: 'pg-soft',
      description: 'Pocket Games Soft is a mobile game development studio. They create high-spec mobile slots optimized for portrait layouts.',
      gameCount: 65,
      avgRtp: '96.70%',
      volatility: 'MEDIUM'
    },
    'netent': {
      name: 'NetEnt',
      logo: 'fas fa-cube text-success',
      slug: 'netent',
      description: 'NetEnt is a premium gaming system provider used by the world’s most successful online casino operators. A true pioneer in slot gaming concepts.',
      gameCount: 110,
      avgRtp: '96.20%',
      volatility: 'HIGH'
    }
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      const info = this.providersInfo[slug] || {
        name: slug.replace(/-/g, ' ').toUpperCase(),
        logo: 'fas fa-dice text-light',
        slug: slug,
        description: 'Premium gaming content developer supplying slots and table releases globally.',
        gameCount: 10,
        avgRtp: '96.10%',
        volatility: 'HIGH'
      };
      this.provider.set(info);
      this.currentPage.set(1);
      this.searchQuery.set('');
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
