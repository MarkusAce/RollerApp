import { exportarExcel, exportarPdf } from '../../../core/utils/exportar-reportes';
import { addIcons } from 'ionicons';
import { receiptOutline, gridOutline, layersOutline, settingsOutline, constructOutline, peopleOutline, cardOutline, listOutline, chevronDownOutline, arrowForwardOutline } from 'ionicons/icons';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EMPTY, Subscription, catchError, interval, startWith, switchMap, finalize } from 'rxjs';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonRefresher, IonRefresherContent, IonIcon } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { AdminKpiService, AdminKpis } from '../../../core/services/admin-kpi.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonRefresher, IonRefresherContent, IonIcon],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent implements OnDestroy {
  constructor() { addIcons({ receiptOutline, gridOutline, layersOutline, settingsOutline, constructOutline, peopleOutline, cardOutline, listOutline, chevronDownOutline, arrowForwardOutline }); }
  auth = inject(AuthService);
  private kpiService = inject(AdminKpiService);
  private consulta?: Subscription;
  kpis = signal<AdminKpis | null>(null);
  error = signal(false);
  cargando = signal(true);

  ionViewWillEnter(): void {
    this.consulta?.unsubscribe();
    this.consulta = interval(30_000).pipe(
      startWith(0),
      switchMap(() => this.kpiService.obtener().pipe(catchError(() => {
        this.error.set(true);
        this.cargando.set(false);
        return EMPTY;
      }))),
    ).subscribe(datos => {
      this.kpis.set(datos);
      this.error.set(false);
      this.cargando.set(false);
    });
  }
  actualizar(event: CustomEvent): void {
    this.kpiService.obtener().pipe(finalize(() => (event.target as HTMLIonRefresherElement).complete())).subscribe({
      next: datos => { this.kpis.set(datos); this.error.set(false); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); },
    });
  }
  readonly columnasReporte = ['Mes', 'Ventas CLP', 'Compras', 'Cotizaciones', 'Concretadas', 'Usuarios nuevos'];
  private datosReporte(): (string | number)[][] {
    return (this.kpis()?.meses ?? []).map(m => [m.mes, m.ventas, m.compras, m.cotizaciones, m.concretadas, m.usuarios]);
  }
  excelReporte(): void { if (this.kpis()) exportarExcel('rollerapp-reporte-mensual', this.columnasReporte, this.datosReporte()); }
  pdfReporte(): void { if (this.kpis()) exportarPdf('Reporte mensual de RollerApp', this.columnasReporte, this.datosReporte()); }
  ionViewWillLeave(): void { this.consulta?.unsubscribe(); }
  ngOnDestroy(): void { this.consulta?.unsubscribe(); }
}
