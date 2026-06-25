import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = `${API_URL}/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.url}/login`, {
      username,
      password
    });
  }

  obtenerUsuarioActual(): Observable<any> {
    return this.http.get<any>(`${this.url}/me`);
  }

  logout(): void {
    fetch('/logout', {
      method: 'POST'
    }).then(() => {
      localStorage.removeItem('usuarioKds');
      window.location.href = '/login';
    });
  }
}