import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientesResponse } from '../models/cliente.model';

export interface PorcentajeSenceResponse {
  sence: number;
  no_sence: number;
}

export interface VentasLider {
  lider: string;
  total: number;
}


@Injectable({
  providedIn: 'root'
})
export class EstadisticaService {
  private apiUrl = 'http://localhost:8000/';
  private http = inject(HttpClient);
  constructor() { }
  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  getDemoraPromedioMensual(): Observable<{ mes: string, demora_promedio: number }[]> {
    return this.http.get<{ mes: string, demora_promedio: number }[]>('/assets/data/demora_promedio_mensual.json');
  }
  obtenerDistribucionSence(): Observable<PorcentajeSenceResponse> {
    return this.http.get<PorcentajeSenceResponse>('/assets/data/sence_porcentaje.json');
  }
  obtenerTiemposEtapas(): Observable<{ etapa: string; dias_promedio: number }[]> {
    return this.http.get<{ etapa: string; dias_promedio: number }[]>('/assets/data/etapas_comercios.json');
  }
  obtenerVentasPorLider(): Observable<VentasLider[]> {
    return this.http.get<VentasLider[]>('/assets/data/ventas_lider_top4.json');
  }
  getProyeccionAnual(ano: number): Observable<any> {
    if (ano === 2025){
      return this.http.get<any>('/assets/data/proyeccion_anual_2025.json');
    }
    if (ano === 2024){
      return this.http.get<any>('/assets/data/proyeccion_anual_2024.json');
    }
    if (ano === 2023){
      return this.http.get<any>('/assets/data/proyeccion_anual_2023.json');
    } 
    return this.http.get<any>('/assets/data/proyeccion_anual_2026.json');
  }
}