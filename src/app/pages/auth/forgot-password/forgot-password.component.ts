import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly submitted = signal(false);

  get f() { return this.forgotForm.controls; }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.forgotForm.invalid) {
      return;
    }

    const { email } = this.forgotForm.value;
    
    this.authService.forgotPassword(email);
    this.toastService.success(`Instructions sent to ${email}! Check your inbox.`);
    
    setTimeout(() => {
      this.router.navigate(['/reset-password']);
    }, 1500);
  }
}
