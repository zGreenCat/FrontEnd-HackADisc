import { Component, inject, NgModule, ViewChild, ElementRef,HostListener } from '@angular/core';
import { ClientesService, ClienteTop } from '../../Services/Cliente.service';
import { ClienteResumen } from '../../models/cliente.model';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EstadisticaService } from '../../Services/Estadistica.service';
import { ChartOptions, ChartType, ChartDataset, ChartData, ChartConfiguration, Colors } from 'chart.js';
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
  imports: [NgFor, HttpClientModule, NgIf, NgChartsModule, NgClass,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private eRef: ElementRef) {}
  @ViewChild('seccionGraficos') seccionGraficos!: ElementRef;
  @ViewChild('seccionTabla') seccionTabla!: ElementRef;
  @ViewChild('seccionHome') seccionHome!: ElementRef;
  @ViewChild('seccionCliente') seccionCliente!: ElementRef;
  @ViewChild('sidebar') sidebarRef!: ElementRef;
  scrollAGraficos() {
    this.seccionGraficos?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  scrollAClientes() {
    this.seccionCliente?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  scrolAlHome() {
    this.seccionHome?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  scrollATabla() {
    this.seccionTabla?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  sidebarVisible = false;
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
   @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideSidebar = this.sidebarRef?.nativeElement.contains(event.target);
    const clickedToggleButton = (event.target as HTMLElement).closest('button')?.classList.contains('toggle-btn');

    if (!clickedInsideSidebar && !clickedToggleButton) {
      this.sidebarVisible = false;
    }
  }
  private clienteService = inject(ClientesService);
  private estadisticasService = inject(EstadisticaService);
  clientesConPrediccion: Set<number> = new Set();
  totalComercializacionesCliente: any;
  estado: 'al_dia' | 'riesgo' | 'atrasado' = 'riesgo';
  topClientes: ClienteTop[] = [];

  barChartLabels: string[] = ['P25 (BAJO)', 'P50 (MEDIO)', 'P75 (ALTO)', 'P90 (CRÍTICO)'];
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.barChartLabels,
    datasets: [
      {
        label: 'COMERCIAL',
        data: [23.0, 41.2, 54.2, 68.4],
        backgroundColor: '#3B82F6' // azul
      },
      {
        label: 'SENCE',
        data: [41.2, 44.4, 61.4, 72.6],
        backgroundColor: '#EF4444' // rojo
      }
    ]
  };

  // Opciones del gráfico
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,

        font: {
          size: 18
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} días`
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Días (Umbrales)',
          font: {
            size: 14
          }
        },
        beginAtZero: true
      },
      x: {
        title: {
          display: true,
          text: 'Categorías de Riesgo',
          font: {
            size: 14
          }
        }
      }
    }
  };
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
    maintainAspectRatio: false,
    indexAxis: 'y',
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
    maintainAspectRatio: false,
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
    backgroundColor: ['#485CC7'],
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
  clientesPorPagina: number = 7;
  ordenActual: keyof ClienteResumen | null = null;
  ordenAscendente: boolean = true;
  barChartDataClienteLider: any;
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
    maintainAspectRatio: false,
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
      this.linepieChardata = {
        labels: ['Ventas Totales', 'Ventas SENCE'],
        datasets: [{
          data: [data.sence, data.no_sence],
          backgroundColor: ['#3B82F6', '#10B981'],
          borderWidth: 0
        }]
      };
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
    this.clienteService.getTopClientes().subscribe(res => {
      this.topClientes = res.top_clientes_pagos;
    });

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
            backgroundColor: ['#0284C7', '#F59E0B', '#00B8DE']
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
    this.cargarGracficoEtapasCliente(cliente.IdCliente);
    this.cargarBarraClienteLideres(cliente.IdCliente);
    this.scrollAClientes();
    this.clienteService.getEstadisticasCliente(cliente.IdCliente).subscribe(data => {
      if (data?.estadisticas_comercializaciones) {
        this.totalComercializacionesCliente = data.estadisticas_comercializaciones.total_comercializaciones;
      } else {
        this.totalComercializacionesCliente = null;
      }
    });
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
        data: [(cliente.total_ventas * 100) / total, (cliente.total_sence * 100) / total],
        backgroundColor: ['#3B82F6', '#10B981'],
        borderWidth: 0
      }]
    };
  }

  cargarGracficoEtapasCliente(cliente_id: number) {
    this.clienteService.getDeltaCliente(cliente_id).subscribe({
      next: (data) => {
        if (!data) {
          console.warn('No hay datos de delta para cliente:', cliente_id);
          return;
        }
        console.log(data);
        // Convertimos el objeto a un arreglo con nombre de etapa y valor
        const etapas = [
          { etapa: 'Proceso → Terminado', dias_promedio: data.delta_x_promedio },
          { etapa: 'Terminado → Factura', dias_promedio: data.delta_y_promedio },
          { etapa: 'Factura → Pago', dias_promedio: data.delta_z_promedio },
        ];

        this.barEtapasDataCliente = {
          labels: etapas.map(e => e.etapa),
          datasets: [{
            label: 'Promedio (días)',
            data: etapas.map(e => e.dias_promedio),
            backgroundColor: ['#0284C7', '#F59E0B', '#10B981']
          }]
        };
        this.barEtapasOptionsCliente = {
          responsive: true,

          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Días'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Etapas'
              }
            }
          },
          plugins: {
            legend: {
              display: true
            }
          }
        };
      },
      error: (err) => {
        console.error('Error al obtener delta del cliente:', err);
      }
    });
  }

  cargarBarraClienteLideres(IdCliente: number) {
    this.clienteService.getLideresPorCliente(IdCliente).subscribe(vendedores => {
      const labels = vendedores.map(v => v.lider_comercial);
      const valores = vendedores.map(v => v.valor_total_vendido);

      this.barChartDataClienteLider = {
        labels,
        datasets: [{
          label: 'Total vendido',
          data: valores,
          backgroundColor: '#60A5FA'
        }]
      };
    });
  }


}
