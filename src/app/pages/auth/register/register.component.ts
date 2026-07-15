import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    agreeTerms: [false, Validators.requiredTrue]
  });

  readonly submitted = signal(false);

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.registerForm.invalid) {
      return;
    }

    const { username, email, password } = this.registerForm.value;
    
    this.authService.register(username, email, password).subscribe({
      next: (response) => {
        if (response && response.status && response.status.code === 0) {
          this.toastService.success(response.status.message || 'Account created successfully! Please log in.');
          this.router.navigate(['/login']);
        } else {
          this.toastService.error(response?.status?.message || 'Registration failed');
        }
      },
      error: (err) => {
        const errorMsg = err.error?.status?.message || 'Registration failed. Please try again.';
        this.toastService.error(errorMsg);
      }
    });
  }
}
