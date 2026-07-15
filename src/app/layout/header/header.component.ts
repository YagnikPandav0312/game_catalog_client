import { Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly isMobileSearchOpen = signal(false);
  readonly isProfileDropdownOpen = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
    if (this.isMobileMenuOpen()) {
      this.isMobileSearchOpen.set(false);
    }
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen.update(open => !open);
    if (this.isMobileSearchOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (res: any) => {
        if (res && res.status.code == 0) {
          this.closeProfileDropdown();
          this.toastService.success(res.status.message, 'Success');
          this.router.navigate(['/']);
        }
        else {
          this.toastService.error(res.status.message, 'Error');
        }
      },
      error: (err) => {
        this.closeProfileDropdown();
        this.toastService.error(err);
        this.router.navigate(['/']);
      }
    });
  }
}
