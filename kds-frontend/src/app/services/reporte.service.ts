import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private url = `${API_URL}/reportes`;

  constructor(private http: HttpClient) {}

  enviarReporteAdmin(fechaInicio: string, fechaFin: string): Observable<any> {
    return this.http.post<any>(`${this.url}/enviar-admin`, {
      fechaInicio,
      fechaFin
    });
  }
}