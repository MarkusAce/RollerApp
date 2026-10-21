import { PasswordToggleComponent } from '../../../shared/password-toggle';
import { correoRegistro, contrasenaSegura, confirmacionesIguales } from '../../../core/utils/auth-validation';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-registro',
  imports: [PasswordToggleComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: '../login/login.scss',
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  enviando = false;
  mostrarContrasena = false;
  mostrarConfirmacion = false;

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', correoRegistro],
    confirmarCorreo: ['', correoRegistro],
    contrasena: ['', [Validators.required, contrasenaSegura]],
    confirmarContrasena: ['', Validators.required],
  }, { validators: confirmacionesIguales });

  enviar(): void {
    if (this.enviando) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const { confirmarCorreo, confirmarContrasena, ...datos } = this.form.getRawValue();
    this.auth.registrar({ ...datos, correo: datos.correo.trim() }).subscribe({
      next: () => {
        this.toast.mostrar('Cuenta creada correctamente. Ya puedes iniciar sesión.', 'exito');
        this.router.navigateByUrl('/login');
      },
      error: (error) => {
        this.toast.mostrar(error.error?.error ?? 'No se pudo crear la cuenta.', 'error');
        this.enviando = false;
      },
    });
  }
}
