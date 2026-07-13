import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  username: string;
  email: string;
  walletBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor() {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch {
        this.logout();
      }
    }
  }

  login(email: string): void {
    const mockToken = 'dummy-jwt-token-header.payload.signature';
    const mockUser: User = {
      id: 777,
      username: 'LuckyGamer',
      email: email,
      walletBalance: 25000.00
    };
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    this.currentUserSignal.set(mockUser);
  }

  register(username: string, email: string): void {
    const mockToken = 'dummy-jwt-token-header.payload.signature';
    const mockUser: User = {
      id: 778,
      username: username,
      email: email,
      walletBalance: 0.00
    };

    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    this.currentUserSignal.set(mockUser);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
  }

  forgotPassword(email: string): void {
    // Simulate forgot password action
  }

  resetPassword(password: string): void {
    // Simulate reset password action
  }

  updateWallet(amount: number): void {
    const user = this.currentUserSignal();
    if (user) {
      const updated = { ...user, walletBalance: user.walletBalance + amount };
      localStorage.setItem('user', JSON.stringify(updated));
      this.currentUserSignal.set(updated);
    }
  }
}
