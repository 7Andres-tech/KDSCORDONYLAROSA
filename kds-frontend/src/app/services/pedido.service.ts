import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private url = `${API_URL}/pedidos`;

  constructor(private http: HttpClient) {}

  listarPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  crearPedido(payload: any): Observable<any> {
    return this.http.post<any>(this.url, payload);
  }

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/estado`, {
      estado: estado
    });
  }

  marcarEntregado(id: number): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/entregar`, {});
  }

  validarLogoutCaja(): Observable<any> {
    return this.http.get<any>(`${this.url}/logout-check/caja`);
  }

  validarLogoutCocina(): Observable<any> {
    return this.http.get<any>(`${this.url}/logout-check/cocina`);
  }
}