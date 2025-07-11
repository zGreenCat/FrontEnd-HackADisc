import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,of } from 'rxjs';
import { ClientesResponse } from '../models/cliente.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = 'http://localhost:8000/';
  private http = inject(HttpClient);
  private predicciones: any[] | null = null;
  private datas: any[] | null = null;
  private deltas:any[] | null = null;
  constructor() { }
  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  obtenerResumenClientes(): Observable<ClientesResponse> {
    const headers = this.getHeaders();
    return this.http.get<ClientesResponse>('/assets/data/clientes.json');
  }
  getPrediccionCliente(clienteId: number): Observable<any> {
    if (this.predicciones) {
      const pred = this.predicciones.find(p => p.cliente_id === clienteId);
      return of(pred);
    } else {
      return this.http.get<any[]>('/assets/data/clientes_pred.json').pipe(
        map(preds => {
          this.predicciones = preds;
          return preds.find(p => p.cliente_id === clienteId);
        })
      );
    }
  }
  getEvolucionMensualPorCliente(clienteId: number): Observable<any> {
    if (this.datas) {
      const data = this.datas.find(p => p.cliente_id === clienteId);
      return of(data);
    } else {
      return this.http.get<any[]>('/assets/data/cliente_lineGraph.json').pipe(
        map(data => {
          this.datas = data;
          return data.find(p => p.cliente_id === clienteId);
        })
      );
    }
  }
  getDeltaCliente(clienteId: number): Observable<any> {
    if (this.deltas) {
      const delta = this.deltas.find(p => p.cliente_id === clienteId);
      return of(delta);
    } else {
      return this.http.get<any[]>('/assets/data/deltas_clientes.json').pipe(
        map(delta => {
          this.deltas = delta;
          return delta.find(p => p.cliente_id === clienteId);
        })
      );
    }
  }
}