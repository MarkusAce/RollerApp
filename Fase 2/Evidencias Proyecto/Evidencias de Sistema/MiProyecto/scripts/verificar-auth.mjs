import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

for (const platform of ['web', 'movil']) {
  const base = new URL(`../frontend-${platform}/`, import.meta.url);
  const require = createRequire(new URL('package.json', base));
  const ts = require('typescript');
  await import(pathToFileURL(require.resolve('@angular/compiler')).href);
  const { FormControl, FormGroup, Validators } = await import(pathToFileURL(require.resolve('@angular/forms')).href);
  const temp = new URL('.auth-validation-test.mjs', base);
  writeFileSync(temp, ts.transpileModule(readFileSync(new URL('src/app/core/utils/auth-validation.ts', base), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText);
  try {
    const { correoValido, correoRegistro, contrasenaSegura, confirmacionesIguales } = await import(temp.href);
    for (const value of ['', 'sin-arroba', 'a@@dominio.cl', 'a b@dominio.cl', 'a@dominio']) assert.ok(correoRegistro(new FormControl(value)));
    for (const value of ['persona+ventas@sub.dominio.cl', ' PERSONA@dominio.cl ']) assert.equal(correoRegistro(new FormControl(value)), null);
    assert.equal(correoValido(new FormControl('a@dominio')), null, 'Login retains existing email validation');
    for (const value of ['', '12345678901', ' '.repeat(12), 'a'.repeat(73), '😀'.repeat(19), 'una frase larga!', 'Una frase larga', 'Una frase larga ', '12345678901!', 'A!123456789', 'A!' + 'a'.repeat(71), 'A!' + '😀'.repeat(18)]) assert.ok(contrasenaSegura(new FormControl(value)));
    for (const value of ['Una frase larga!', 'A!' + 'a'.repeat(10), 'A!' + 'a'.repeat(70), 'Á!' + 'a'.repeat(69), 'Ñcontraseña segura#', 'A!' + '😀'.repeat(17)]) assert.equal(contrasenaSegura(new FormControl(value)), null);
    const form = new FormGroup({ correo: new FormControl(' Persona@dominio.cl '), confirmarCorreo: new FormControl('persona@dominio.cl'), contrasena: new FormControl('una frase larga '), confirmarContrasena: new FormControl('una frase larga ') }, { validators: confirmacionesIguales });
    assert.equal(form.errors, null);
    form.controls.confirmarContrasena.setValue('una frase larga');
    assert.ok(form.hasError('contrasenaDistinta'), 'Password spaces are significant');
    form.controls.confirmarCorreo.setValue('otra@dominio.cl');
    assert.ok(form.hasError('correoDistinto'));
    const legacyPassword = new FormControl('123456', Validators.required);
    assert.ok(legacyPassword.valid, 'Existing short passwords can still log in');
    console.log(`${platform}: correo, mayúscula, carácter especial, límites Unicode/BCrypt, confirmaciones y compatibilidad correctos.`);
  } finally { unlinkSync(temp); }
}
