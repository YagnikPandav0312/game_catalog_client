import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Games {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getGames(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${API.games_api.get_games}`);
  }
}

