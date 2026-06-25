import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private url = `${API_URL}/productos`;

  constructor(private http: HttpClient) {}

  listarProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post<any>(this.url, producto);
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}