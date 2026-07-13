import { Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Game, Promotion, Provider } from '../../models/home.model';
import { Home } from '../../core/services/home';
import { Common } from '../../core/services/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {

  private homeService = inject(Home);
  public games = signal<any[]>([]);
  public providers = signal<any[]>([]);
  public categories = signal<any[]>([]);
  public commonService = inject(Common);

  constructor() {
    this.getHome();
  }

  getHome() {
    this.commonService.showSpinner();
    this.homeService.getHome().subscribe({
      next: (res: any) => {
        if (res && res.status.code === 0) {
          this.games.set(res.data.games);
          this.providers.set(res.data.providers);
          this.categories.set(res.data.categories)
          this.commonService.hideSpinner();
        } else {
          this.commonService.manageStatus(res.status);
          this.commonService.hideSpinner();
        }
      }, error: (err: any) => {
        this.commonService.manageStatus(err.status);
        this.commonService.hideSpinner();
      }
    })
  }

  // readonly providers = signal<Provider[]>([
  //   { id: 1, name: 'PRAGMATIC PLAY', logo: 'fas fa-gamepad text-danger', slug: 'pragmatic-play' },
  //   { id: 2, name: 'Evolution', logo: 'fas fa-video text-warning', slug: 'evolution' },
  //   { id: 3, name: 'PG SOFT', logo: 'fas fa-mobile-alt text-primary', slug: 'pg-soft' },
  //   { id: 4, name: 'NETENT', logo: 'fas fa-cube text-success', slug: 'netent' },
  //   { id: 5, name: 'PLAY\'N GO', logo: 'fas fa-play-circle text-info', slug: 'play-n-go' },
  //   { id: 6, name: 'HACKSAW GAMING', logo: 'fas fa-dice text-light', slug: 'hacksaw-gaming' },
  //   { id: 7, name: 'YGGDRASIL', logo: 'fas fa-tree text-warning', slug: 'yggdrasil' },
  //   { id: 8, name: 'SPRIBE', logo: 'fas fa-paper-plane text-danger', slug: 'spribe' }
  // ]);

  // readonly categories = signal([
  //   { id: 1, name: 'Slots', count: 480, icon: 'fas fa-dharmachakra', slug: 'slots', color: '#ff007f' },
  //   { id: 2, name: 'Live Casino', count: 120, icon: 'fas fa-microphone', slug: 'live-casino', color: '#8c52ff' },
  //   { id: 3, name: 'Table Games', count: 65, icon: 'fas fa-dice-five', slug: 'table-games', color: '#00e676' },
  //   { id: 4, name: 'Instant Games', count: 32, icon: 'fas fa-bolt', slug: 'instant-games', color: '#ffd600' },
  //   { id: 5, name: 'Jackpots', count: 18, icon: 'fas fa-trophy', slug: 'jackpots', color: '#2979ff' }
  // ]);

  // readonly games = signal<Game[]>([
  //   { id: 101, title: 'Sweet Bonanza', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80', category: 'Slots', slug: 'sweet-bonanza', isPopular: true },
  //   { id: 102, title: 'Gates of Olympus', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80', category: 'Slots', slug: 'gates-of-olympus', isPopular: true },
  //   { id: 103, title: 'The Dog House', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', category: 'Slots', slug: 'the-dog-house-megaways', isPopular: true },
  //   { id: 104, title: 'Wanted Dead or a Wild', provider: 'Hacksaw Gaming', image: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?w=400&q=80', category: 'Slots', slug: 'wanted-dead-or-a-wild', isPopular: true },
  //   { id: 105, title: 'Sugar Rush', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80', category: 'Slots', slug: 'sugar-rush', isPopular: true },
  //   { id: 106, title: 'Book of Dead', provider: 'Play\'n GO', image: 'https://images.unsplash.com/photo-1600577916048-804c9191e36c?w=400&q=80', category: 'Slots', slug: 'book-of-dead', isPopular: true },
  //   { id: 107, title: 'Big Bass Splash', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=400&q=80', category: 'Slots', slug: 'big-bass-splash', isPopular: true },
  //   { id: 108, title: 'Starburst', provider: 'NetEnt', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', category: 'Slots', slug: 'starburst', isPopular: true }
  // ]);

  readonly newGames = signal<Game[]>([
    { id: 201, title: 'Zeus vs Hades', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=400&q=80', category: 'Slots', slug: 'zeus-vs-hades', isNew: true },
    { id: 202, title: 'Floating Dragon', provider: 'PG Soft', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80', category: 'Slots', slug: 'floating-dragon', isNew: true },
    { id: 203, title: 'Mummyland Treasures', provider: 'Relax Gaming', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&q=80', category: 'Slots', slug: 'mummyland-treasures', isNew: true },
    { id: 204, title: 'Joker\'s Jewels', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80', category: 'Slots', slug: 'jokers-jewels', isNew: true },
    { id: 205, title: 'Wild West Gold', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=400&q=80', category: 'Slots', slug: 'wild-west-gold', isNew: true },
    { id: 206, title: 'Buffalo King Megaways', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', category: 'Slots', slug: 'buffalo-king-megaways', isNew: true },
    { id: 207, title: 'Cash Bonanza', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80', category: 'Slots', slug: 'cash-bonanza', isNew: true },
    { id: 208, title: 'Rise of Olympus', provider: 'Play\'n GO', image: 'https://images.unsplash.com/photo-1549880180-850d700c5945?w=400&q=80', category: 'Slots', slug: 'rise-of-olympus', isNew: true }
  ]);

  readonly promotions = signal<Promotion[]>([
    { id: 1, title: 'Double Welcome Pack', description: 'Get 100% bonus up to ₹50,000 + 200 free spins on your first deposit.', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&q=80', badge: 'WELCOME', color: 'linear-gradient(135deg, #8c52ff, #007bff)' },
    { id: 2, title: 'VIP Weekly Cashback', description: 'Recover up to 20% of your net losses every single Monday automatically.', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&q=80', badge: 'VIP EXCLUSIVE', color: 'linear-gradient(135deg, #ffd700, #ff8c00)' },
    { id: 3, title: 'Pragmatic Drops & Wins', description: 'Play Pragmatic slots and win a share of the ₹2,000,000 daily pool.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', badge: 'TOURNAMENT', color: 'linear-gradient(135deg, #ff007f, #7b2cbf)' }
  ]);

  subscribeNewsletter(email: string, event: Event): void {
    event.preventDefault();
    if (email && email.trim() !== '') {
      alert(`Thank you! ${email} has been subscribed to Game Catalog Casino newsletters.`);
    }
  }
}
