import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = [
  'public/icons',
  'scripts',
  'src/app',
  'src/features/game',
  'src/features/truco',
  'src/features/home',
  'src/features/settings',
  'src/components',
  'src/platform',
  'src/i18n',
  'src/styles',
];

for (const dir of dirs) {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

const files = {
  'src/styles/tokens.css': `:root,
[data-theme='dark'] {
  /* Base Dark Theme (Default) */
  --color-bg: #0f1226;
  --color-surface: #1a1f3d;
  --color-surface-2: #252b52;
  --color-border: #323a6b;
  --color-text: #f2f4ff;
  --color-text-muted: #9aa3cf;

  /* Accents & Semantic */
  --color-accent: #7c5cff;
  --color-accent-hover: #6946ff;
  --color-accent-2: #22d3ee;
  --color-success: #3ddc97;
  --color-warning: #ffd93d;
  --color-error: #ff5c7a;

  /* Shadows */
  --shadow-sm: 0 4px 12px rgba(5, 7, 20, 0.35);
  --shadow-md: 0 10px 25px rgba(5, 7, 20, 0.5);
}

[data-theme='light'] {
  /* Light Theme */
  --color-bg: #f5f6ff;
  --color-surface: #ffffff;
  --color-surface-2: #e9ecff;
  --color-border: #d3d8f5;
  --color-text: #1b1e3a;
  --color-text-muted: #5b6191;

  --color-accent: #7c5cff;
  --color-accent-hover: #6946ff;
  --color-accent-2: #22d3ee;
  --color-success: #3ddc97;
  --color-warning: #ffd93d;
  --color-error: #ff5c7a;

  --shadow-sm: 0 4px 12px rgba(27, 30, 58, 0.08);
  --shadow-md: 0 10px 25px rgba(27, 30, 58, 0.14);
}

:root {
  /* Block Puzzle Palette (7 colors) */
  --block-red: #ff5c7a;
  --block-orange: #ff9f43;
  --block-yellow: #ffd93d;
  --block-green: #3ddc97;
  --block-cyan: #4cc9f0;
  --block-blue: #4d7cff;
  --block-purple: #b388ff;

  /* Truco Table Identity */
  --truco-felt-start: #0e5a3a;
  --truco-felt-end: #137a4d;
  --truco-wood: #8b5a2b;
  --truco-ivory: #f5ebd0;
  --truco-gold: #e6b422;
  --truco-us: #3ddc97;
  --truco-them: #ff5c7a;

  /* Typography */
  --font-display: 'Fredoka', system-ui, -apple-system, sans-serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;

  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border Radius (Playful 16-24px) */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Layout */
  --app-max-width: 480px;
  --nav-height: 68px;
}
`,

  'src/styles/global.css': `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  height: 100%;
  min-height: 100dvh;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.2s ease, color 0.2s ease;
  overflow-x: hidden;
}

#root {
  min-height: 100dvh;
  display: flex;
  justify-content: center;
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-display);
  letter-spacing: 0.01em;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

:focus-visible {
  outline: 3px solid var(--color-accent-2);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`,

  'src/i18n/es-AR.ts': `import { APP_NAME } from '@/app/config';

export const esAR = {
  app: {
    name: APP_NAME,
    subtitle: 'Bloques + Truco Argentino',
  },
  nav: {
    home: 'Inicio',
    game: 'Juego',
    truco: 'Truco',
    settings: 'Ajustes',
    ariaLabel: 'Navegación principal',
  },
  home: {
    toggleThemeAria: 'Cambiar tema claro u oscuro',
    gameCard: {
      badge: 'PUZZLE 8x8',
      title: 'Bloques',
      description: 'Ubicá piezas, limpiá filas y columnas y armá combos.',
      highScoreLabel: 'Récord',
      playNew: 'Jugar ahora',
      continueGame: 'Continuar partida',
    },
    trucoCard: {
      badge: 'ANOTADOR',
      title: 'Truco Argentino',
      description: 'Paño tradicional con fósforos, buenas y malas.',
      statusLabel: 'Estado',
      noActiveMatch: 'Mesa lista (a 30 pts)',
      openTable: 'Abrir anotador',
    },
    stats: {
      title: 'Tus Estadísticas',
      bestScore: 'Mejor Puntaje',
      gamesPlayed: 'Partidas Bloques',
      trucoWinsUs: 'Victorias Nosotros',
      trucoWinsThem: 'Victorias Ellos',
    },
  },
  placeholders: {
    gameTitle: 'Módulo de Juego (Fase 2 y 3)',
    gameDesc: 'Acá vamos a construir el tablero 8x8 con drag & drop.',
    trucoTitle: 'Anotador de Truco (Fase 5)',
    trucoDesc: 'Acá irá la mesa con paño verde y fósforos.',
    settingsTitle: 'Ajustes (Fase 6)',
    settingsDesc: 'Configuración de sonido, vibración, tema y datos.',
  },
} as const;

export type Dictionary = typeof esAR;
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

  'src/components/AppShell.module.css': `.shell {
  width: 100%;
  max-width: var(--app-max-width);
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  position: relative;
}

.main {
  flex: 1;
  padding: var(--space-4);
  padding-bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + var(--space-6));
  overflow-y: auto;
}

.bottomNav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  height: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  z-index: 50;
  box-shadow: var(--shadow-md);
}

.navItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 44px;
  min-width: 44px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
  transition: color 0.15s ease, transform 0.15s ease;
}

.navItem:active {
  transform: scale(0.95);
}

.navItemActive {
  color: var(--color-accent);
}

.indicator {
  width: 20px;
  height: 3px;
  border-radius: var(--radius-full);
  background-color: transparent;
  margin-bottom: 2px;
  transition: background-color 0.15s ease;
}

.navItemActive .indicator {
  background-color: var(--color-accent);
}
`,

  'src/components/AppShell.tsx': `import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Club, Settings } from 'lucide-react';
import { t } from '@/i18n';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navItems = [
    { to: '/', label: t.nav.home, icon: Home, end: true },
    { to: '/game', label: t.nav.game, icon: Grid },
    { to: '/truco', label: t.nav.truco, icon: Club },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <div className={styles.shell}>
      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav} aria-label={t.nav.ariaLabel}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? \`\${styles.navItem} \${styles.navItemActive}\` : styles.navItem
            }
          >
            <span className={styles.indicator} />
            <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
`,

  'src/features/home/HomeScreen.module.css': `.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-2);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logoBox {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-2));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.title {
  font-size: 1.65rem;
  line-height: 1.1;
  color: var(--color-text);
}

.subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.themeBtn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.cardsGrid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card {
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: relative;
  overflow: hidden;
}

.cardGame {
  border-color: var(--color-accent);
  background: linear-gradient(160deg, var(--color-surface) 60%, rgba(124, 92, 255, 0.15) 100%);
}

.cardTruco {
  border-color: var(--truco-felt-end);
  background: linear-gradient(160deg, var(--color-surface) 55%, rgba(19, 122, 77, 0.22) 100%);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  background-color: var(--color-surface-2);
  color: var(--color-accent-2);
}

.badgeTruco {
  color: var(--truco-gold);
}

.cardTitle {
  font-size: 1.45rem;
  margin-top: var(--space-2);
}

.cardDesc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.metaRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-surface-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

.metaLabel {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.metaValue {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-warning);
}

.actionsRow {
  display: flex;
  gap: var(--space-3);
}

.primaryBtn {
  flex: 1;
  min-height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: #ffffff;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-sm);
  transition: transform 0.12s ease, background-color 0.15s ease;
}

.primaryBtn:active {
  transform: scale(0.98);
}

.trucoBtn {
  background-color: var(--truco-felt-end);
}

.secondaryBtn {
  flex: 1;
  min-height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.statsSection {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.statsTitle {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.statItem {
  background-color: var(--color-surface-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.statValue {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

.statLabel {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
`,

  'src/features/home/HomeScreen.tsx': `import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Club, Sun, Moon } from 'lucide-react';
import { t } from '@/i18n';
import { useSettingsStore } from '@/features/settings/settingsStore';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const navigate = useNavigate();
  const {
    theme,
    toggleQuickTheme,
    highScore,
    gamesPlayed,
    hasSavedGame,
    trucoWinsUs,
    trucoWinsThem,
  } = useSettingsStore();

  return (
    <div className={styles.container}>
      {/* Top Header with Logo & Theme Toggle */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoBox} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="3" width="10" height="10" rx="3" fill="#FFD93D" />
              <rect x="15" y="3" width="10" height="10" rx="3" fill="#FF5C7A" />
              <rect x="3" y="15" width="10" height="10" rx="3" fill="#3DDC97" />
              <rect x="15" y="15" width="10" height="10" rx="3" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>{t.app.name}</h1>
            <p className={styles.subtitle}>{t.app.subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.themeBtn}
          onClick={toggleQuickTheme}
          aria-label={t.home.toggleThemeAria}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Main Feature Cards */}
      <div className={styles.cardsGrid}>
        {/* Card 1: Block Puzzle */}
        <section className={\`\${styles.card} \${styles.cardGame}\`}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.badge}>{t.home.gameCard.badge}</span>
              <h2 className={styles.cardTitle}>{t.home.gameCard.title}</h2>
            </div>
            <Trophy size={28} color="var(--color-warning)" aria-hidden="true" />
          </div>

          <p className={styles.cardDesc}>{t.home.gameCard.description}</p>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{t.home.gameCard.highScoreLabel}</span>
            <span className={styles.metaValue}>{highScore} pts</span>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => navigate('/game')}
            >
              <Play size={18} fill="currentColor" />
              {t.home.gameCard.playNew}
            </button>
            {hasSavedGame && (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => navigate('/game')}
              >
                {t.home.gameCard.continueGame}
              </button>
            )}
          </div>
        </section>

        {/* Card 2: Truco Scorekeeper */}
        <section className={\`\${styles.card} \${styles.cardTruco}\`}>
          <div className={styles.cardHeader}>
            <div>
              <span className={\`\${styles.badge} \${styles.badgeTruco}\`}>
                {t.home.trucoCard.badge}
              </span>
              <h2 className={styles.cardTitle}>{t.home.trucoCard.title}</h2>
            </div>
            <Club size={28} color="var(--truco-us)" aria-hidden="true" />
          </div>

          <p className={styles.cardDesc}>{t.home.trucoCard.description}</p>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{t.home.trucoCard.statusLabel}</span>
            <span className={styles.metaValue} style={{ color: 'var(--truco-us)' }}>
              {t.home.trucoCard.noActiveMatch}
            </span>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={\`\${styles.primaryBtn} \${styles.trucoBtn}\`}
              onClick={() => navigate('/truco')}
            >
              <Club size={18} />
              {t.home.trucoCard.openTable}
            </button>
          </div>
        </section>
      </div>

      {/* Compact Stats Block */}
      <section className={styles.statsSection} aria-labelledby="stats-heading">
        <h3 id="stats-heading" className={styles.statsTitle}>
          {t.home.stats.title}
        </h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{highScore}</span>
            <span className={styles.statLabel}>{t.home.stats.bestScore}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{gamesPlayed}</span>
            <span className={styles.statLabel}>{t.home.stats.gamesPlayed}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: 'var(--truco-us)' }}>
              {trucoWinsUs}
            </span>
            <span className={styles.statLabel}>{t.home.stats.trucoWinsUs}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: 'var(--truco-them)' }}>
              {trucoWinsThem}
            </span>
            <span className={styles.statLabel}>{t.home.stats.trucoWinsThem}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
`,

  'src/app/App.tsx': `import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { useSettingsStore, applyThemeToDOM } from '@/features/settings/settingsStore';
import { t } from '@/i18n';

function PlaceholderView({ title, desc }: { title: string; desc: string }) {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        marginTop: 'var(--space-4)',
      }}
    >
      <h2 style={{ marginBottom: 'var(--space-2)' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
    </section>
  );
}

export function App() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route
            path="/game"
            element={
              <PlaceholderView
                title={t.placeholders.gameTitle}
                desc={t.placeholders.gameDesc}
              />
            }
          />
          <Route
            path="/truco"
            element={
              <PlaceholderView
                title={t.placeholders.trucoTitle}
                desc={t.placeholders.trucoDesc}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderView
                title={t.placeholders.settingsTitle}
                desc={t.placeholders.settingsDesc}
              />
            }
          />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
`,

  'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@/styles/tokens.css';
import '@/styles/global.css';
import { App } from '@/app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

  'GUIA.md': `# Guía Paso a Paso — TrucoBlock

- [x] Fase 0: Setup inicial
- [x] Fase 1: Design system (tokens, temas), layout, navegación inferior e Inicio
- [ ] Fase 2: Lógica del juego (funciones puras + tests)
- [ ] Fase 3: UI del juego: tablero, bandeja, drag & drop, vista previa
- [ ] Fase 4: Pulido del juego: animaciones, combos, sonido, vibración, pausa, persistencia
- [ ] Fase 5: Truco: lógica + tests + UI + palitos + historial
- [ ] Fase 6: Ajustes, estadísticas, compartir, i18n, accesibilidad
- [ ] Fase 7: PWA: manifest, service worker, íconos, offline, instalación
- [ ] Fase 8: QA y deploy
- [ ] Fase 9: (Futuro) iOS con Capacitor
`,
};

for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = join(process.cwd(), relativePath);
  writeFileSync(fullPath, content, 'utf8');
  console.log('[OK] Actualizado:', relativePath);
}

console.log('\n¡Fase 1 instalada con éxito!');