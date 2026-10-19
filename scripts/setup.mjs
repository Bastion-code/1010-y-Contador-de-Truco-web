import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = [
  'src/features/settings',
];

for (const dir of dirs) {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

const files = {
  'src/i18n/es-AR.ts': `import { APP_NAME, APP_VERSION } from '@/app/config';

export const esAR = {
  app: {
    name: APP_NAME,
    version: \`Versión \${APP_VERSION}\`,
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
  game: {
    score: 'Puntaje',
    best: 'Récord',
    combo: 'Combo',
    pauseAria: 'Pausar partida',
    boardAria: 'Tablero de bloques 8 por 8',
    trayAria: 'Bandeja de piezas disponibles',
    gameOverTitle: '¡Partida Terminada!',
    gameOverDesc: 'Ninguna de las piezas restantes entra en el tablero.',
    newRecordBadge: '¡Nuevo récord!',
    finalScore: 'Puntaje final',
    playAgain: 'Jugar de nuevo',
    shareScore: 'Compartir puntaje',
    shareCopied: '¡Copiado al portapapeles!',
    pauseTitle: 'Partida en Pausa',
    resume: 'Continuar',
    restart: 'Reiniciar partida',
    quit: 'Salir al inicio',
  },
  truco: {
    us: 'Nosotros',
    them: 'Ellos',
    malas: 'MALAS',
    buenas: 'BUENAS',
    meta15: 'A 15 puntos',
    meta30: 'A 30 puntos',
    undo: 'Deshacer',
    reset: 'Nueva partida',
    matchWon: '¡Partida ganada!',
    revancha: 'Jugar revancha',
    historyTitle: 'Historial de Partidas',
    winsCount: 'victorias',
  },
  settings: {
    title: 'Ajustes y Preferencias',
    sound: 'Efectos de sonido',
    soundDesc: 'Tonos sintetizados al colocar y limpiar bloques',
    haptics: 'Vibración háptica',
    hapticsDesc: 'Respuesta táctil al interactuar',
    theme: 'Tema visual',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
    themeAuto: 'Automático (Sistema)',
    data: 'Gestión de datos',
    resetData: 'Borrar todos los datos',
    resetConfirm: '¿Estás seguro de borrar récords y estadísticas? Esta acción no se puede deshacer.',
    cancel: 'Cancelar',
    confirm: 'Sí, borrar',
    about: 'Acerca de',
    credits: 'Desarrollado como PWA 2 en 1 offline-first.',
  },
} as const;

export type Dictionary = typeof esAR;
`,

  'src/features/settings/SettingsScreen.module.css': `.screen {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: var(--space-6);
}

.sectionTitle {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.group {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.itemInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.itemLabel {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
}

.itemDesc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Switch Toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  transition: 0.2s;
  border-radius: var(--radius-full);
}

.slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: var(--color-text-muted);
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

input:checked + .slider:before {
  transform: translateX(24px);
  background-color: #ffffff;
}

/* Select Theme */
.select {
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  outline: none;
}

.dangerBtn {
  width: 100%;
  min-height: 46px;
  border-radius: var(--radius-md);
  background-color: rgba(255, 92, 122, 0.12);
  border: 1px solid var(--color-error);
  color: var(--color-error);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.dangerBtn:active { transform: scale(0.98); }

.aboutBox {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-accent);
}

/* Modal Confirm */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 18, 38, 0.86);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 50;
}

.modal {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-shadow: var(--shadow-md);
}

.modalActions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.cancelBtn {
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-md);
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  font-family: var(--font-display);
  font-weight: 600;
}

.confirmBtn {
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-md);
  background-color: var(--color-error);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 600;
}
`,

  'src/features/settings/SettingsScreen.tsx': `import { useState } from 'react';
import { Trash2, Info } from 'lucide-react';
import { t } from '@/i18n';
import { useSettingsStore, type ThemeMode } from './settingsStore';
import styles from './SettingsScreen.module.css';

export function SettingsScreen() {
  const {
    theme,
    setTheme,
    soundEnabled,
    hapticsEnabled,
    setSoundEnabled,
    setHapticsEnabled,
    resetAllData,
  } = useSettingsStore();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetConfirm = () => {
    resetAllData();
    setShowConfirm(false);
  };

  return (
    <div className={styles.screen}>
      <h2 className={styles.sectionTitle}>{t.settings.title}</h2>

      {/* Preferences Group */}
      <div className={styles.group}>
        {/* Sound */}
        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>{t.settings.sound}</span>
            <span className={styles.itemDesc}>{t.settings.soundDesc}</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        {/* Haptics */}
        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>{t.settings.haptics}</span>
            <span className={styles.itemDesc}>{t.settings.hapticsDesc}</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={hapticsEnabled}
              onChange={(e) => setHapticsEnabled(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        {/* Theme Select */}
        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>{t.settings.theme}</span>
          </div>
          <select
            className={styles.select}
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeMode)}
          >
            <option value="dark">{t.settings.themeDark}</option>
            <option value="light">{t.settings.themeLight}</option>
            <option value="auto">{t.settings.themeAuto}</option>
          </select>
        </div>
      </div>

      {/* Data Management Group */}
      <div className={styles.group}>
        <div className={styles.itemInfo}>
          <span className={styles.itemLabel}>{t.settings.data}</span>
        </div>
        <button
          type="button"
          className={styles.dangerBtn}
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 size={18} />
          {t.settings.resetData}
        </button>
      </div>

      {/* About Group */}
      <div className={styles.group}>
        <div className={styles.item}>
          <div className={styles.aboutBox}>
            <span className={styles.itemLabel}>{t.app.name}</span>
            <span className={styles.version}>{t.app.version}</span>
            <span className={styles.itemDesc}>{t.settings.credits}</span>
          </div>
          <Info size={24} color="var(--color-text-muted)" />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 style={{ fontFamily: 'var(--font-display)' }}>{t.settings.resetData}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {t.settings.resetConfirm}
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
              >
                {t.settings.cancel}
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleResetConfirm}
              >
                {t.settings.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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
      resetAllData: () =>
        set({
          highScore: 0,
          gamesPlayed: 0,
          hasSavedGame: false,
          trucoWinsUs: 0,
          trucoWinsThem: 0,
        }),
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

  'src/app/App.tsx': `import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { GameScreen } from '@/features/game/GameScreen';
import { TrucoScreen } from '@/features/truco/TrucoScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { useSettingsStore, applyThemeToDOM } from '@/features/settings/settingsStore';

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
          <Route path="/game" element={<GameScreen />} />
          <Route path="/truco" element={<TrucoScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
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
- [ ] Fase 7: PWA: manifest, service worker, íconos, offline, instalación
- [ ] Fase 8: QA y deploy
- [ ] Fase 9: (Futuro) iOS con Capacitor
`,
};

for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = join(process.cwd(), relativePath);
  writeFileSync(fullPath, content, 'utf8');
  console.log('[OK] Creado/Actualizado:', relativePath);
}

console.log('\n¡Fase 6 lista! Ejecutá el commit.');