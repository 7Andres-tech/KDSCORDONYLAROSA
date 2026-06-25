import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MercadopagoService {

  private url = `${API_URL}/pagos`;

  constructor(private http: HttpClient) {}

  crearPago(pedidoId: number, total: number): Observable<any> {
    return this.http.post<any>(`${this.url}/crear`, {
      pedidoId,
      total
    });
  }
}