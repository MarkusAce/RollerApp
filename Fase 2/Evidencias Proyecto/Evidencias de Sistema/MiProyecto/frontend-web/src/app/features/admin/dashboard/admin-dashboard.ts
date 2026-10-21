import { exportarExcel, exportarPdf } from '../../../core/utils/exportar-reportes';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { EMPTY, Subscription, catchError, interval, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AdminKpiService, AdminKpis, MesKpi } from '../../../core/services/admin-kpi.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private kpiService = inject(AdminKpiService);
  private consulta?: Subscription;
  kpis = signal<AdminKpis | null>(null);
  error = signal(false);
  ngOnInit(): void {
    this.consulta = interval(30_000).pipe(
      startWith(0),
      switchMap(() => this.kpiService.obtener().pipe(catchError(() => {
        this.error.set(true);
        return EMPTY;
      }))),
    ).subscribe({
      next: datos => { this.kpis.set(datos); this.error.set(false); },
    });
  }
  private datosReporte(): (string | number)[][] {
    return (this.kpis()?.meses ?? []).map(m => [m.mes, m.ventas, m.compras, m.cotizaciones, m.concretadas, m.usuarios]);
  }
  readonly columnasReporte = ['Mes', 'Ventas CLP', 'Compras', 'Cotizaciones', 'Concretadas', 'Usuarios nuevos'];
  excelReporte(): void { exportarExcel('rollerapp-reporte-mensual', this.columnasReporte, this.datosReporte()); }
  pdfReporte(): void { exportarPdf('Reporte mensual de RollerApp', this.columnasReporte, this.datosReporte()); }
  ngOnDestroy(): void { this.consulta?.unsubscribe(); }
  alto(mes: MesKpi, campo: 'compras' | 'usuarios' | 'cotizaciones' | 'ventas'): number {
    const maximo = Math.max(1, ...(this.kpis()?.meses.map(m => m[campo]) ?? []));
    return mes[campo] / maximo * 100;
  }
  etiquetaMes(mes: string): string {
    const [anio, numero] = mes.split('-');
    return `${numero}/${anio.slice(2)}`;
  }
}
