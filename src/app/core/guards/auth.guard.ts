import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastService } from '../services/toast';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isLoggedIn()) {
    return true;
  }

  toastService.error('Please log in to access this page.');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
