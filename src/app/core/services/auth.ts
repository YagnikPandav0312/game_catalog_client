import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { API } from '../constants/api-endpoints';

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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
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
        this.clearLocalSession();
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${API.player_api.login}`, { email, password }).pipe(
      tap(response => {
        if (response && response.status && response.status.code === 0 && response.data) {
          const { token, player } = response.data;
          const user: User = {
            id: player.player_id,
            username: player.full_name,
            email: player.email,
            walletBalance: 25000.00 // Simulated wallet balance
          };
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSignal.set(user);
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${API.player_api.register}`, {
      full_name: username,
      email,
      password
    });
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.clearLocalSession();
      return of({ status: { code: 0, message: 'Logged out locally' } });
    }

    return this.http.post<any>(`${this.baseUrl}${API.player_api.logout}`, {}).pipe(
      finalize(() => {
        this.clearLocalSession();
      })
    );
  }

  private clearLocalSession(): void {
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
