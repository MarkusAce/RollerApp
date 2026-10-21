import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-password-toggle',
  standalone: true,
  template: `<button type="button" [attr.aria-label]="visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="visible()" [attr.aria-controls]="target()" (click)="toggle.emit()">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>@if (visible()) { <path d="M3 3l18 18"/> }</svg>
  </button>`,
  styles: [`:host { display: inline-flex; } button { display:flex; align-items:center; justify-content:center; min-width:44px; min-height:44px; border:0; border-radius:6px; background:transparent; color:inherit; cursor:pointer; } button:focus-visible { outline:2px solid currentColor; outline-offset:2px; }`],
})
export class PasswordToggleComponent {
  visible = input(false);
  target = input('contrasena');
  toggle = output<void>();
}
