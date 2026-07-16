import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { API } from '../constants/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Filters {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getFilters(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${API.filters_api.get_filters}`);
  }
}
