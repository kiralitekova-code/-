import { readFileSync, existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(root, 'js', 'assetmap.js'), 'utf8');

const paths = [...src.matchAll(/"([^"]+\.(?:png|webp|jpg|jpeg|gif|svg))"/gi)].map(m => m[1]);
let ok = 0, bad = [];
for (const p of paths) {
  const f = join(root, 'assets', p);
  if (existsSync(f) && statSync(f).isFile()) ok++;
  else bad.push(p);
}
console.log('Всего путей в assetmap.js:', paths.length);
console.log('Найдено в assets/:', ok);
if (bad.length) { console.log('НЕ ХВАТАЕТ:'); bad.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('Чек-лист пройден: все ассеты из архива на месте, внешних ссылок нет.');
