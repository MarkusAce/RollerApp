const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
for (const app of ['frontend-web', 'frontend-movil']) {
 const ts = require(path.join(root, app, 'node_modules/typescript'));
 const source = fs.readFileSync(path.join(root,app,'src/app/features/producto-detalle/producto-detalle.ts'),'utf8');
 const body = source.split('previsualizacion = computed(() => {')[1].split('\n  });')[0];
 const preview = new Function(ts.transpile(body));
 const raw = {anchoCm:100,altoCm:100,telaId:1,mecanismoId:1,servicioIds:[1]};
 const context = {valoresFormulario:()=>{},form:{getRawValue:()=>raw,invalid:false},telas:()=>[{id:1,precioM2:100000}],mecanismos:()=>[{id:1,valorFijo:10000}],servicios:()=>[{id:1,precio:20000}],producto:()=>({anchoMaxCm:300,altoMaxCm:400})};
 let result = preview.call(context);
 assert.equal(result.subtotal,130000); assert.equal(result.iva,24700); assert.equal(result.total,154700);
 raw.servicioIds=[];raw.anchoCm=50;raw.altoCm=50;
 result=preview.call(context);assert.equal(result.aplicaCobroMinimo,true);assert.equal(result.total,130900);
 raw.anchoCm=301;assert.equal(preview.call(context),null);
 raw.anchoCm=0;assert.equal(preview.call(context),null);
 const method=source.split("  errorCampo(")[1].split('\n  private valoresFormulario')[0];
 const compiled=ts.transpile('function errorCampo('+method);
 const errorCampo=new Function(compiled+';return errorCampo;')();
 const ctrl={touched:true,dirty:false,value:null,invalid:true};
 const errors={form:{controls:{anchoCm:ctrl,direccion:ctrl}},producto:context.producto};
 assert.match(errorCampo.call(errors,'anchoCm'),/Ingresa ancho/);
 ctrl.value=0;assert.match(errorCampo.call(errors,'anchoCm'),/al menos 1/);
 ctrl.value=301;assert.match(errorCampo.call(errors,'anchoCm'),/máximo es 300/);
 ctrl.value=300;ctrl.invalid=false;assert.equal(errorCampo.call(errors,'anchoCm'),'');
 ctrl.value='   ';assert.match(errorCampo.call(errors,'direccion'),/Ingresa dirección/);
 console.log(app+': IVA, servicios, cobro mínimo, límites y alertas OK');
}
