import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastr = inject(ToastrService);

  success(message: string, title?: string, override?: any): void {
    this.toastr.success(message, title, override);
  }

  error(message: string, title?: string, override?: any): void {
    this.toastr.error(message, title, override);
  }

  info(message: string, title?: string, override?: any): void {
    this.toastr.info(message, title, override);
  }

  warning(message: string, title?: string, override?: any): void {
    this.toastr.warning(message, title, override);
  }
}
