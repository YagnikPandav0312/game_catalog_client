import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class CategoriesComponent {
  readonly searchQuery = signal<string>('');

  readonly allCategories = signal<CategoryItem[]>([
    {
      id: 1,
      name: 'Slots',
      count: 480,
      icon: 'fas fa-dharmachakra',
      slug: 'slots',
      color: '#ff007f',
      description: 'Spin to win in thousands of slots with unique features, free spins, and megaways.'
    },
    {
      id: 2,
      name: 'Live Casino',
      count: 120,
      icon: 'fas fa-microphone',
      slug: 'live-casino',
      color: '#8c52ff',
      description: 'Experience the real casino action with live dealers in real-time streaming.'
    },
    {
      id: 3,
      name: 'Table Games',
      count: 65,
      icon: 'fas fa-dice-five',
      slug: 'table-games',
      color: '#00e676',
      description: 'Test your strategy on classic games like Blackjack, Roulette, and Baccarat.'
    },
    {
      id: 4,
      name: 'Instant Games',
      count: 32,
      icon: 'fas fa-bolt',
      slug: 'instant-games',
      color: '#ffd600',
      description: 'Fast-paced crash games, mines, and plinko for instant big payouts.'
    },
    {
      id: 5,
      name: 'Jackpots',
      count: 18,
      icon: 'fas fa-trophy',
      slug: 'jackpots',
      color: '#2979ff',
      description: 'Play for massive prize pools and life-changing jackpot payouts.'
    }
  ]);

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
}
