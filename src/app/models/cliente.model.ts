export interface ClienteResumen {
  IdCliente: number;
  NombreCliente: string;
  total_ventas: number;
  total_sence: number;

  dias_predichos?: number;
  nivel_riesgo?: 'BAJO' | 'MEDIO' | 'CRITICO' | 'ALTO';
}

export interface ClientesResponse {
  clientes: ClienteResumen[];
  total_clientes: number;
}