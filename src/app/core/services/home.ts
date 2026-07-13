import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})

export class Home {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getHome(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${API.home_api.get_home}`);
  }
  
}
