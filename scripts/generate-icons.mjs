import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Generador automático de SVG para iconos PWA
const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="100%" height="100%" rx="${size * 0.22}" fill="#0F1226"/>
  <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.32}" height="${size * 0.32}" rx="${size * 0.08}" fill="#FFD93D"/>
  <rect x="${size * 0.53}" y="${size * 0.15}" width="${size * 0.32}" height="${size * 0.32}" rx="${size * 0.08}" fill="#FF5C7A"/>
  <rect x="${size * 0.15}" y="${size * 0.53}" width="${size * 0.32}" height="${size * 0.32}" rx="${size * 0.08}" fill="#3DDC97"/>
  <rect x="${size * 0.53}" y="${size * 0.53}" width="${size * 0.32}" height="${size * 0.32}" rx="${size * 0.08}" fill="#7C5CFF"/>
</svg>`;

writeFileSync(join(process.cwd(), 'public/icons/icon-192.svg'), createSvgIcon(192));
writeFileSync(join(process.cwd(), 'public/icons/icon-512.svg'), createSvgIcon(512));
console.log('[OK] Íconos PWA SVG generados correctamente en public/icons/');
