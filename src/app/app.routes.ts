import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'providers',
        loadComponent: () => import('./pages/providers/providers.component').then(m => m.ProvidersComponent)
      },
      {
        path: 'providers/:slug',
        loadComponent: () => import('./pages/providers/provider-detail/provider-detail.component').then(m => m.ProviderDetailComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'categories/:slug',
        loadComponent: () => import('./pages/categories/category-detail/category-detail.component').then(m => m.CategoryDetailComponent)
      },
      {
        path: 'games',
        loadComponent: () => import('./pages/games/games.component').then(m => m.GamesComponent)
      },
      {
        path: 'games/:slug',
        loadComponent: () => import('./pages/games/game-detail/game-detail.component').then(m => m.GameDetailComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
