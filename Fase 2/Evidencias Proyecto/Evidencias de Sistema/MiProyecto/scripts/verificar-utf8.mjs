import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const decoder = new TextDecoder('utf-8', { fatal: true });
let count = 0;
const errors = [];
async function inspect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) { await inspect(path); continue; }
    if (!['.html', '.ts', '.scss', '.css', '.svg', '.json'].includes(extname(path))) continue;
    count++;
    try {
      const source = decoder.decode(await readFile(path));
      if (/\uFFFD|Ã[\u0080-\u00BF]|Â[\u0080-\u00BF]|[\p{L}]\?[\p{L}]/u.test(source.replace(/https?:[^\s'"`<>]+/g, '').replace(/\/(?:admin|auditoria)\?pagina/g, '').replace(/abrir\?token/g, ''))) {
        errors.push(`${path}: posible texto con codificación dañada`);
      }
    } catch { errors.push(`${path}: UTF-8 inválido`); }
  }
}
await inspect(resolve(root, 'frontend-web/src'));
await inspect(resolve(root, 'frontend-movil/src'));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`UTF-8 correcto: ${count} archivos de frontend revisados.`);
