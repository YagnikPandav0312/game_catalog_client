import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Categories } from '../../core/services/categories';
import { Games } from '../../core/services/games';
import { Common } from '../../core/services/common';
import { forkJoin } from 'rxjs';

export interface CategoryItem {
  id: number;
  name: string;
  count: number;
  icon: string;
  slug: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  private readonly categoriesService = inject(Categories);
  private readonly gamesService = inject(Games);
  private readonly commonService = inject(Common);

  readonly searchQuery = signal<string>('');
  readonly allCategories = signal<CategoryItem[]>([]);

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
    this.commonService.showSpinner();
    forkJoin({
      categoriesRes: this.categoriesService.getCategories(),
      gamesRes: this.gamesService.getGames({})
    }).subscribe({
      next: ({ categoriesRes, gamesRes }) => {
        if (categoriesRes && categoriesRes.status && categoriesRes.status.code === 0) {
          const categories = categoriesRes.data || [];
          const games = (gamesRes && gamesRes.status && gamesRes.status.code === 0) ? (gamesRes.data || []) : [];

          const mappedCategories = categories.map((c: any) => {
            const styles = this.categoryStyles[c.slug] || {
              color: '#8c52ff',
              icon: 'fas fa-dice text-light',
              description: 'Explore premium catalog of games curated specifically for you.'
            };

            return {
              id: c.game_categorie_id,
              name: c.game_categorie_name,
              slug: c.slug,
              color: styles.color,
              icon: styles.icon,
              description: styles.description,
              count: games.filter((g: any) => this.isGameInCategory(g, c.game_categorie_name, c.slug)).length
            };
          });

          this.allCategories.set(mappedCategories);
        } else if (categoriesRes && categoriesRes.status) {
          this.commonService.manageStatus(categoriesRes.status);
        }
        this.commonService.hideSpinner();
      },
      error: (err) => {
        this.commonService.manageStatus(err.status || { code: 2, message: 'Failed to load categories data' });
        this.commonService.hideSpinner();
      }
    });
  }

  readonly filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allCategories();
    return this.allCategories().filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  });

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
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
}
