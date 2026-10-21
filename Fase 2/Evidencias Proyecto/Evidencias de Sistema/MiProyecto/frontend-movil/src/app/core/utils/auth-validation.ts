import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

// Trim only email addresses. Passwords must reach the API exactly as entered.
export const correoValido: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return { required: true };
  return Validators.email({ value } as AbstractControl);
};
export const correoRegistro: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  return correoValido(control) || (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? { email: true } : null);
};
export const contrasenaSegura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  // BCrypt accepts at most 72 UTF-8 bytes; never truncate silently.
  return Array.from(value).length < 12 || new TextEncoder().encode(value).length > 72 || !/\p{Lu}/u.test(value) || !/[\p{P}\p{S}]/u.test(value)
    ? { passwordPolicy: true } : null;
};
export const confirmacionesIguales: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const errors: ValidationErrors = {};
  if (String(form.get('correo')?.value ?? '').trim().toLowerCase() !== String(form.get('confirmarCorreo')?.value ?? '').trim().toLowerCase()) errors['correoDistinto'] = true;
  if (form.get('contrasena')?.value !== form.get('confirmarContrasena')?.value) errors['contrasenaDistinta'] = true;
  return Object.keys(errors).length ? errors : null;
};
