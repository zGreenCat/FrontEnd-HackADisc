# HACKADISC - Frontend 
---

## Descripción del Proyecto

Este frontend implementa el **dashboard ejecutivo de HackADisc**, una solución visual desarrollada en Angular que permite analizar el comportamiento de pago de sus clientes a lo largo del ciclo de venta, facturación y cobro.

El objetivo principal del dashboard es **proveer visualizaciones claras, filtrables e interactivas** que permitan tomar decisiones financieras informadas basadas en datos históricos y modelos predictivos procesados previamente.

### Funcionalidades del frontend

-  **Gráficos interactivos** que muestran:
    - Tiempos promedio entre etapas del proceso de venta.
    - Comparativas de pago entre clientes y líderes comerciales.
    - Comparativas de ventas con Sence y sin.
    - Proyección de pagos futuros según historial.

-  **Filtros dinámicos** para seleccionar:
    - Cliente específico

-  **Paneles de resumen** con métricas clave:
    - Total vendido, cobrado y pendiente.
    - Días promedio entre etapas.
    - Cantidad de facturas por cliente.

-  **Diseño responsivo y modular**, optimizado para distintos dispositivos y escalable para incorporar nuevas visualizaciones.

Este dashboard es el principal punto de interacción para los usuarios de negocio y analistas, entregando una experiencia clara, ágil y centrada en la toma de decisiones.

---

##  Tech Stack

- **Frontend**: Angular (vXX)  
- **Estilos**: SCSS + Angular Material (o Tailwind, si aplica)  
- **HTTP**: HttpClient + RxJS  
- **Build y deploy**: Vercel / Angular CLI

---

##  Estructura del proyecto

```txt
/
├── src/
│   ├── app/
        ├── dashboard/ # Página Principal
            ├── home
            ├── dashboard-routing
            └── dashboard.module
│   │   ├── services/       # Comunicación API
│   │   └── models/         # Interfaces/DTOs
├── assets/                 # Imágenes, logos, estilos globales, JSONS
├── environments/           # Configuración dev/prod
├── angular.json            # Configuración Angular CLI
├── tsconfig.json           # Configuración TypeScript
└── package.json            # Dependencias y scripts

```
##  Instalación local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/zGreenCat/FrontEnd-HackADisc.git
   cd FrontEnd-HackADisc
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Ejecuta en modo desarrollo:
   ```bash
   ng serve
   ```

   Abre `http://localhost:4200/home` en tu navegador.

---

##  Scripts disponibles

| Comando              | Descripción                         |
|----------------------|-------------------------------------|
| `ng serve`           | Lanza app en modo desarrollo        |

---

## Roadmap

### Implementado

- Visualización de indicadores clave por cliente:
  - Tiempo desde inicio de venta hasta pago
  - Días promedio entre etapas (venta → factura → abono)
- Comparativa por líder comercial
- Diferenciación entre ventas con y sin SENCE
- Proyección de pagos basada en historial
- Panel de resumen con:
  - Total vendido, cobrado y pendiente
  - Cantidad de facturas por cliente
- Diseño responsivo y estructura modular Angular
- Consumo de archivos `.json` como fuente de datos estáticos

### En desarrollo o futuros pasos

- Integración con backend (API REST o modelo predictivo en producción)
- Alerta o semáforo de riesgo de pago por cliente
- Búsqueda global y filtrado por rango de fechas
- Exportación de reportes (Excel/PDF)
- Personalización de gráficos (selección de métricas, zoom, etc.)
- Autenticación y control de acceso por roles (ejecutivo, analista)
- Soporte multiempresa o multiárea
- Hosting permanente + deploy automatizado (CI/CD)

---

##  Licencia

**Desarrollado para HACKADISC 2025**

*Sebastian Concha M. / ML Engineer*
*Fernando Condori G. / Full Stack Developer*
*Vicente Araya R. / Full Stack Developer*

> Accede a la demo: [https://front-end-hack-a-disc.vercel.app/home](https://front-end-hack-a-disc.vercel.app/home)

---




