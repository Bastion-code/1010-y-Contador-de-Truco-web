import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = [
  'public/icons',
  'scripts',
  'src/features/settings',
];

for (const dir of dirs) {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

const files = {
  'scripts/generate-icons.mjs': `import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Generador automático de SVG para iconos PWA
const createSvgIcon = (size) => \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${size} \${size}" width="\${size}" height="\${size}">
  <rect width="100%" height="100%" rx="\${size * 0.22}" fill="#0F1226"/>
  <rect x="\${size * 0.15}" y="\${size * 0.15}" width="\${size * 0.32}" height="\${size * 0.32}" rx="\${size * 0.08}" fill="#FFD93D"/>
  <rect x="\${size * 0.53}" y="\${size * 0.15}" width="\${size * 0.32}" height="\${size * 0.32}" rx="\${size * 0.08}" fill="#FF5C7A"/>
  <rect x="\${size * 0.15}" y="\${size * 0.53}" width="\${size * 0.32}" height="\${size * 0.32}" rx="\${size * 0.08}" fill="#3DDC97"/>
  <rect x="\${size * 0.53}" y="\${size * 0.53}" width="\${size * 0.32}" height="\${size * 0.32}" rx="\${size * 0.08}" fill="#7C5CFF"/>
</svg>\`;

writeFileSync(join(process.cwd(), 'public/icons/icon-192.svg'), createSvgIcon(192));
writeFileSync(join(process.cwd(), 'public/icons/icon-512.svg'), createSvgIcon(512));
console.log('[OK] Íconos PWA SVG generados correctamente en public/icons/');
`,

  'public/manifest.webmanifest': `{
  "name": "TrucoBlock",
  "short_name": "TrucoBlock",
  "description": "Juego de bloques 8x8 y anotador de Truco Argentino",
  "start_url": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0F1226",
  "theme_color": "#0F1226",
  "icons": [
    {
      "src": "icons/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
`,

  'vite.config.ts': `/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.svg'],
      manifest: false, // Usamos nuestro manifest.webmanifest en public/
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
`,

  'index.html': `<!doctype html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#0F1226" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>TrucoBlock</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  'src/features/settings/settingsStore.ts': `import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { webStorage } from '@/platform';

export type ThemeMode = 'dark' | 'light' | 'auto';

interface SettingsState {
  theme: ThemeMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  wakeLockEnabled: boolean;
  highScore: number;
  gamesPlayed: number;
  hasSavedGame: boolean;
  trucoWinsUs: number;
  trucoWinsThem: number;
  setTheme: (theme: ThemeMode) => void;
  toggleQuickTheme: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  resetAllData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      soundEnabled: true,
      hapticsEnabled: true,
      wakeLockEnabled: true,
      highScore: 0,
      gamesPlayed: 0,
      hasSavedGame: false,
      trucoWinsUs: 0,
      trucoWinsThem: 0,
      setTheme: (theme) => set({ theme }),
      toggleQuickTheme: () => {
        const current = get().theme;
        set({ theme: current === 'light' ? 'dark' : 'light' });
      },
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      resetAllData: () => {
        set({
          highScore: 0,
          gamesPlayed: 0,
          hasSavedGame: false,
          trucoWinsUs: 0,
          trucoWinsThem: 0,
        });
        // Limpiamos también el storage del juego guardado
        webStorage.removeItem('trucoblock-game');
      },
    }),
    {
      name: 'trucoblock-settings',
      storage: createJSONStorage(() => webStorage),
    }
  )
);

export function applyThemeToDOM(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
`,

  'GUIA.md': `# Guía Paso a Paso — TrucoBlock

- [x] Fase 0: Setup inicial
- [x] Fase 1: Design system (tokens, temas), layout, navegación inferior e Inicio
- [x] Fase 2: Lógica del juego (funciones puras + tests)
- [x] Fase 3: UI del juego: tablero, bandeja, drag & drop, vista previa
- [x] Fase 4: Pulido del juego: animaciones, combos, sonido, vibración, pausa, persistencia
- [x] Fase 5: Truco: lógica + tests + UI + palitos + historial
- [x] Fase 6: Ajustes, estadísticas, compartir, i18n, accesibilidad
- [x] Fase 7: PWA: manifest, service worker, íconos, offline, instalación
- [ ] Fase 8: QA y deploy
- [ ] Fase 9: (Futuro) iOS con Capacitor
`,
};

for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = join(process.cwd(), relativePath);
  writeFileSync(fullPath, content, 'utf8');
  console.log('[OK] Creado/Actualizado:', relativePath);
}

console.log('\n¡Corrección de borrado y Fase 7 aplicadas!');