import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private url = `${API_URL}/admin`;

  constructor(private http: HttpClient) {}

  obtenerDashboard(): Observable<any> {
    return this.http.get<any>(`${this.url}/dashboard`);
  }

  obtenerDashboardPorFechas(fechaInicio: string, fechaFin: string): Observable<any> {
    return this.http.get<any>(
      `${this.url}/dashboard/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
  }

  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/usuarios`);
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.url}/usuarios`, usuario);
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.url}/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/usuarios/${id}`);
  }

  listarNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/notificaciones`);
  }

  marcarNotificacionesLeidas(): Observable<any> {
    return this.http.patch<any>(`${this.url}/notificaciones/leer`, {});
  }
}