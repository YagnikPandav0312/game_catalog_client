import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})

export class Providers {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getProviders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${API.providers_api.get_providers}`);
  }
}
