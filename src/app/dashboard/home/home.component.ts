import { Component, inject, NgModule } from '@angular/core';
import { ClientesService } from '../../Services/Cliente.service';
import { ClienteResumen } from '../../models/cliente.model';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EstadisticaService } from '../../Services/Estadistica.service';
import { ChartOptions, ChartType, ChartDataset, ChartData } from 'chart.js';

import { NgChartsModule } from 'ng2-charts';
import { NgModel } from '@angular/forms';



export interface PorcentajeSenceResponse {
  sence: number;
  no_sence: number;
}
export interface VentasLider {
  lider: string;
  total: number;
}



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, HttpClientModule, NgIf, NgChartsModule, NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private clienteService = inject(ClientesService);
  private estadisticasService = inject(EstadisticaService);
  clientesConPrediccion: Set<number> = new Set();
  //Data Grafico de pie general
  lineOptionsPie = {
    responsive: true,
    maintainAspectRatio: false,
  };
  linepieChardata: ChartData<'pie'> = {
    labels: ['SENCE', 'No SENCE'],
    datasets: [
      {
        data: [],
        borderWidth: 0,
        backgroundColor: ['#4caf50', '#f44336']
      }
    ]
  };

  lineOptionsPieCliente = {
    responsive: true,
    maintainAspectRatio: false,
  };
  linepieChardataCliente: ChartData<'pie'> = {
    labels: ['SENCE', 'No SENCE'],
    datasets: [
      {
        data: [],
        borderWidth: 0,
        backgroundColor: ['#4caf50', '#f44336']
      }
    ]
  };


  //Data Grafico de Barras Etapas
  barEtapasData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  barEtapasOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Días'
        },
        beginAtZero: true
      }
    }
  };

  barEtapasDataCliente: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  barEtapasOptionsCliente: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Días'
        },
        beginAtZero: true
      }
    }
  };

  barVentasData: ChartData<'bar'> = { labels: [], datasets: [] };
  barVentasOptions: ChartOptions = { responsive: true, plugins: { legend: { display: false } } };

  lineData: ChartDataset<'line'>[] = [
    { data: [], label: 'Demora (días)' }
  ];
  lineLabels: string[] = [];

  lineOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };

  lineColors = [{ backgroundColor: 'rgba(72,92,199,0.2)', borderColor: '#485CC7' }];
  clienteSeleccionado: ClienteResumen | null = null;
  clientes: ClienteResumen[] = [];
  totalClientes: number = 0;
  // Paginación
  paginaActual: number = 1;
  clientesPorPagina: number = 10;
  ordenActual: keyof ClienteResumen | null = null;
  ordenAscendente: boolean = true;

  scatterData = [
    {
      label: 'Ventas proyectadas',
      data: [
        { x: 2021, y: 150000 },
        { x: 2022, y: 180000 },
        { x: 2023, y: 210000 },
        { x: 2024, y: 250000 },
      ],
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#2563eb',
      showLine: true,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.3)',
    }
  ];
  lineChartData: any;
  lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };
  evolucionChartData: any;
  evolucionChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true },
      x: { title: { display: true, text: 'Mes' } }
    }
  };

  ngOnInit() {

    this.clienteService.obtenerResumenClientes().subscribe({
      next: (respuesta) => {
        this.clientes = respuesta.clientes;
        this.totalClientes = respuesta.total_clientes;
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
      }
    });
    console.log(this.clientes);
    this.estadisticasService.obtenerDistribucionSence().subscribe(data => {
      console.log(data.sence)
      this.linepieChardata.datasets[0].data = [data.sence, data.no_sence];
    });
    this.estadisticasService.obtenerVentasPorLider().subscribe((datos: VentasLider[]) => {
      this.barVentasData = {
        labels: datos.map(d => d.lider),
        datasets: [{
          label: 'Total Ventas',
          data: datos.map(d => d.total),
          backgroundColor: '#0ea5e9',
        }]
      };
    });
    this.cargarTiemposEtapas();
    this.cargarDemoraMensual();
    this.cargarProyeccionAnual(2025);

  }
  get clientesPaginados(): ClienteResumen[] {
    const inicio = (this.paginaActual - 1) * this.clientesPorPagina;
    const fin = inicio + this.clientesPorPagina;
    const paginados = this.clientes.slice(inicio, fin);

    // Predecir solo si no está ya hecho
    paginados.forEach(cliente => {
      if (!this.clientesConPrediccion.has(cliente.IdCliente)) {
        this.clientesConPrediccion.add(cliente.IdCliente);
        this.clienteService.getPrediccionCliente(cliente.IdCliente).subscribe(pred => {
          cliente.dias_predichos = pred.dias_predichos;
          cliente.nivel_riesgo = pred.nivel_riesgo;
          console.log(cliente.IdCliente, cliente.dias_predichos)
        });
      }
    });

    return paginados;
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientes.length / this.clientesPorPagina);
  }
  irPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }
  ordenarPor(campo: keyof ClienteResumen) {
    if (this.ordenActual === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenActual = campo;
      this.ordenAscendente = true;
    }

    this.clientes.sort((a, b) => {
      const valorA = a[campo] ?? '';
      const valorB = b[campo] ?? '';
      return this.ordenAscendente
        ? valorA > valorB ? 1 : -1
        : valorA < valorB ? 1 : -1;
    });
  }
  cargarDemoraMensual() {
    this.estadisticasService.getDemoraPromedioMensual().subscribe(data => {
      this.lineLabels = data.map(d => d.mes);
      this.lineData[0].data = data.map(d => d.demora_promedio);
    });
  }
  cargarTiemposEtapas() {
    this.estadisticasService.obtenerTiemposEtapas().subscribe(data => {
      console.log(data.map(d => d.dias_promedio));
      this.barEtapasData = {
        labels: data.map(d => d.etapa),

        datasets: [
          {
            label: 'Promedio (días)',
            data: data.map(d => d.dias_promedio),
            backgroundColor: ['#0284C7', '#F59E0B', '#10B981']
          }
        ]
      };
    });
  }
  cargarProyeccionAnual(ano: number) {
    this.estadisticasService.getProyeccionAnual(ano).subscribe(data => {
      const labels: string[] = [];
      const ventas: number[] = [];
      const cobros: number[] = [];

      const valores = data.valores_mensuales;
      for (const mesKey of Object.keys(valores)) {
        const item = valores[mesKey];
        labels.push(item.nombre);

        // Usar predicción si no hay ventas reales
        const venta = item.detalles.valor_ventas_reales || item.detalles.valor_predicciones;
        ventas.push(venta);

        // Solo tomar cobros si hay datos reales
        cobros.push(item.fuente === 'datos_reales' ? item.detalles.valor_cobrado_real : 0);
      }
      console.log(cobros);
      this.lineChartData = {
        labels,
        datasets: [
          {
            label: 'Valor Ventas',
            data: ventas,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            tension: 0.4
          },
          {
            label: 'Valor Cobrado',
            data: cobros,
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            tension: 0.4
          }
        ]
      };
    });
  }
  onCambioAno(event: Event) {
    const select = event.target as HTMLSelectElement;
    const añoSeleccionado = parseInt(select.value, 10);
    this.cargarProyeccionAnual(añoSeleccionado);
  }
  seleccionarCliente(cliente: ClienteResumen): void {
    this.clienteSeleccionado = cliente;
    this.cargarEvolucionMensual(cliente.IdCliente);
    this.cargarGraficoPieCliente(cliente.IdCliente);
  }
  cargarEvolucionMensual(clienteId: number) {
    this.clienteService.getEvolucionMensualPorCliente(clienteId).subscribe(res => {
      console.log(res);
      const labels = res.evolucion_mensual.map((d: any) => d.mes);
      const ventas = res.evolucion_mensual.map((d: any) => d.valor_ventas);
      const cobros = res.evolucion_mensual.map((d: any) => d.valor_cobrado);

      this.evolucionChartData = {
        labels,
        datasets: [
          {
            label: 'Ventas',
            data: ventas,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.2)',
            tension: 0.3
          },
          {
            label: 'Cobros',
            data: cobros,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.2)',
            tension: 0.3
          }
        ]
      };
    });
  }
  cargarGraficoPieCliente(clienteId: number) {
    const cliente = this.clientes.find(p => p.IdCliente === clienteId);
    if (!cliente) return;
    const total = cliente.total_ventas + cliente.total_sence;
    this.linepieChardataCliente = {
      labels: ['Ventas Totales', 'Ventas SENCE'],
      datasets: [{
        data: [(cliente.total_ventas * 100)/ total, (cliente.total_sence * 100) / total],
        backgroundColor: ['#3B82F6', '#10B981'],
        borderWidth: 0
      }]
    };
  }



}
