import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ClientesResponse } from '../models/cliente.model';
import { map } from 'rxjs/operators';

export interface ClienteTop {
  ranking: number;
  cliente_id: number;
  cliente_nombre: string;
  total_pagado: number;
  cantidad_facturas_pagadas: number;
  cantidad_comercializaciones: number;
  promedio_por_factura: number;
}

export interface RespuestaTopClientes {
  top_clientes_pagos: ClienteTop[];
}


@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = 'http://localhost:8000/';
  private http = inject(HttpClient);
  private predicciones: any[] | null = null;
  private datas: any[] | null = null;
  private deltas: any[] | null = null;
  private clientesConVendedores: any[] | null = null;
  private estadisticas: any[] | null = null;
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
  getTopClientes(): Observable<RespuestaTopClientes> {
    return this.http.get<RespuestaTopClientes>('/assets/data/top5.json');
  }

  getLideresPorCliente(clienteId: number): Observable<any[]> {
    if (this.clientesConVendedores !== null) {
      const cliente = this.clientesConVendedores.find(c => c.cliente_id === clienteId);
      return of(cliente?.vendedores || []);
    } else {
      return this.http.get<any>('/assets/data/clientes_con_lideres.json').pipe(
        map(data => {
          this.clientesConVendedores = data.clientes_con_vendedores;
          const cliente = this.clientesConVendedores?.find(c => c.cliente_id === clienteId);
          return cliente?.vendedores || [];
        })
      );
    }
  }
  
 getEstadisticasCliente(clienteId: number): Observable<any> {
  if (this.estadisticas) {
    const cliente = this.estadisticas.find(c => c.cliente_id === clienteId);
    return of(cliente);
  } else {
    return this.http.get<any>('/assets/data/comer_total.json').pipe(
      map(data => {
        this.estadisticas = data.clientes; // accede al array interno
        return this.estadisticas!.find(c => c.cliente_id === clienteId);
      })
    );
  }
}
}