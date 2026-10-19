import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = [
  'src/features/truco',
];

for (const dir of dirs) {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

const files = {
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
  placeholders: {
    settingsTitle: 'Ajustes (Fase 6)',
    settingsDesc: 'Configuración de sonido, vibración, tema y datos.',
  },
} as const;

export type Dictionary = typeof esAR;
`,

  'src/features/truco/trucoEngine.ts': `export type TargetScore = 15 | 30;

export interface TrucoMatchState {
  target: TargetScore;
  usScore: number;
  themScore: number;
  winner: 'us' | 'them' | null;
  history: { us: number; them: number }[];
}

export function createTrucoMatch(target: TargetScore = 30): TrucoMatchState {
  return {
    target,
    usScore: 0,
    themScore: 0,
    winner: null,
    history: [],
  };
}

export function addPoints(
  state: TrucoMatchState,
  team: 'us' | 'them',
  points: number
): TrucoMatchState {
  if (state.winner !== null) return state;

  const currentUs = state.usScore;
  const currentThem = state.themScore;

  const nextUs = team === 'us' ? Math.min(state.target, currentUs + points) : currentUs;
  const nextThem = team === 'them' ? Math.min(state.target, currentThem + points) : currentThem;

  let winner: 'us' | 'them' | null = null;
  if (nextUs >= state.target) winner = 'us';
  else if (nextThem >= state.target) winner = 'them';

  return {
    ...state,
    usScore: nextUs,
    themScore: nextThem,
    winner,
    history: [...state.history, { us: currentUs, them: currentThem }],
  };
}

export function undoTrucoMatch(state: TrucoMatchState): TrucoMatchState {
  if (state.history.length === 0) return state;
  const lastState = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  return {
    ...state,
    usScore: lastState.us,
    themScore: lastState.them,
    winner: null,
    history: newHistory,
  };
}
`,

  'src/features/truco/trucoEngine.test.ts': `import { describe, it, expect } from 'vitest';
import { createTrucoMatch, addPoints, undoTrucoMatch } from './trucoEngine';

describe('Truco Engine', () => {
  it('initializes match correctly', () => {
    const match = createTrucoMatch(30);
    expect(match.usScore).toBe(0);
    expect(match.themScore).toBe(0);
    expect(match.winner).toBeNull();
    expect(match.target).toBe(30);
  });

  it('adds points and detects winner when target is reached', () => {
    let match = createTrucoMatch(15);
    match = addPoints(match, 'us', 12);
    expect(match.usScore).toBe(12);
    expect(match.winner).toBeNull();

    match = addPoints(match, 'us', 4);
    expect(match.usScore).toBe(15);
    expect(match.winner).toBe('us');
  });

  it('supports undoing last action', () => {
    let match = createTrucoMatch(30);
    match = addPoints(match, 'us', 3);
    match = addPoints(match, 'them', 2);
    expect(match.usScore).toBe(3);
    expect(match.themScore).toBe(2);

    match = undoTrucoMatch(match);
    expect(match.usScore).toBe(3);
    expect(match.themScore).toBe(0);
  });
});
`,

  'src/features/truco/TrucoScreen.module.css': `.screen {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: linear-gradient(135deg, #0e5a3a 0%, #137a4d 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  border: 3px solid var(--truco-wood);
  box-shadow: var(--shadow-md);
  color: var(--truco-ivory);
  min-height: calc(100dvh - 120px);
}

.topBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.targetSelector {
  display: flex;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 3px;
  border-radius: var(--radius-full);
  gap: 2px;
}

.targetBtn {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--truco-ivory);
  background: transparent;
  transition: background-color 0.15s ease;
}

.targetBtnActive {
  background-color: var(--truco-gold);
  color: #1b1e3a;
}

.topActions {
  display: flex;
  gap: var(--space-2);
}

.iconBtn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--truco-ivory);
  transition: transform 0.1s ease;
}

.iconBtn:active { transform: scale(0.92); }
.iconBtn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Teams Board Grid */
.teamsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  flex: 1;
}

.teamColumn {
  background-color: rgba(0, 0, 0, 0.22);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.teamHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.teamName {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
}

.teamScoreBig {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--truco-gold);
  line-height: 1;
}

/* Matchsticks Area */
.matchesBox {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.28);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 160px;
  overflow-y: auto;
}

.sectionLabel {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--truco-gold);
  opacity: 0.85;
}

.bundleGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bundle {
  width: 32px;
  height: 32px;
  border: 1px dashed rgba(245, 235, 208, 0.25);
  border-radius: var(--radius-sm);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.matchstick {
  position: absolute;
  background-color: var(--truco-ivory);
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.stick1 { width: 3px; height: 22px; left: 6px; top: 5px; }
.stick2 { width: 3px; height: 22px; left: 12px; top: 5px; }
.stick3 { width: 3px; height: 22px; left: 18px; top: 5px; }
.stick4 { width: 3px; height: 22px; left: 24px; top: 5px; }
.stick5 {
  width: 30px;
  height: 3px;
  left: 1px;
  top: 15px;
  transform: rotate(35deg);
}

/* Score Buttons */
.controlsStack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quickRow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.quickBtn {
  min-height: 38px;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.15);
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--truco-ivory);
  transition: background-color 0.1s ease;
}

.quickBtn:active { background-color: var(--truco-gold); color: #1b1e3a; }

.mainPlusBtn {
  min-height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--truco-gold);
  color: #1b1e3a;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.mainPlusBtn:active { transform: scale(0.97); }

/* Celebration Overlay */
.overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(14, 90, 58, 0.94);
  backdrop-filter: blur(6px);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  z-index: 30;
}

.modalTitle {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--truco-gold);
  text-align: center;
}

.modalSub {
  font-size: 1.1rem;
  text-align: center;
}

.primaryBtn {
  width: 100%;
  max-width: 280px;
  min-height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--truco-gold);
  color: #1b1e3a;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}
`,

  'src/features/truco/TrucoScreen.tsx': `import { useState, useEffect } from 'react';
import { Undo2, RotateCcw, Trophy } from 'lucide-react';
import { t } from '@/i18n';
import { useSettingsStore } from '@/features/settings/settingsStore';
import {
  createTrucoMatch,
  addPoints,
  undoTrucoMatch,
  type TargetScore,
  type TrucoMatchState,
} from './trucoEngine';
import { triggerHaptic } from '@/platform/haptics';
import styles from './TrucoScreen.module.css';

export function TrucoScreen() {
  const { trucoWinsUs, trucoWinsThem } = useSettingsStore();
  const [match, setMatch] = useState<TrucoMatchState>(() => createTrucoMatch(30));

  const handleAdd = (team: 'us' | 'them', pts: number) => {
    const next = addPoints(match, team, pts);
    triggerHaptic(20);

    if (next.winner && !match.winner) {
      if (next.winner === 'us') {
        useSettingsStore.setState({ trucoWinsUs: trucoWinsUs + 1 });
      } else {
        useSettingsStore.setState({ trucoWinsThem: trucoWinsThem + 1 });
      }
    }
    setMatch(next);
  };

  const handleUndo = () => {
    setMatch(undoTrucoMatch(match));
    triggerHaptic(10);
  };

  const handleReset = (target: TargetScore = match.target) => {
    setMatch(createTrucoMatch(target));
    triggerHaptic(15);
  };

  const renderBundles = (score: number) => {
    const bundlesCount = Math.ceil(score / 5);
    const bundles = [];

    for (let i = 0; i < bundlesCount; i++) {
      const sticksInBundle = Math.min(5, score - i * 5);
      bundles.push(
        <div key={i} className={styles.bundle}>
          {sticksInBundle >= 1 && <div className={\`\${styles.matchstick} \${styles.stick1}\`} />}
          {sticksInBundle >= 2 && <div className={\`\${styles.matchstick} \${styles.stick2}\`} />}
          {sticksInBundle >= 3 && <div className={\`\${styles.matchstick} \${styles.stick3}\`} />}
          {sticksInBundle >= 4 && <div className={\`\${styles.matchstick} \${styles.stick4}\`} />}
          {sticksInBundle === 5 && <div className={\`\${styles.matchstick} \${styles.stick5}\`} />}
        </div>
      );
    }
    return bundles;
  };

  // Split score into Malas (0-15) and Buenas (15-30) when target is 30
  const is30 = match.target === 30;
  const usMalas = is30 ? Math.min(15, match.usScore) : match.usScore;
  const usBuenas = is30 ? Math.max(0, match.usScore - 15) : 0;
  const themMalas = is30 ? Math.min(15, match.themScore) : match.themScore;
  const themBuenas = is30 ? Math.max(0, match.themScore - 15) : 0;

  return (
    <div className={styles.screen}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.targetSelector}>
          <button
            type="button"
            className={\`\${styles.targetBtn} \${match.target === 15 ? styles.targetBtnActive : ''}\`}
            onClick={() => handleReset(15)}
          >
            {t.truco.meta15}
          </button>
          <button
            type="button"
            className={\`\${styles.targetBtn} \${match.target === 30 ? styles.targetBtnActive : ''}\`}
            onClick={() => handleReset(30)}
          >
            {t.truco.meta30}
          </button>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleUndo}
            disabled={match.history.length === 0}
            aria-label={t.truco.undo}
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => handleReset(match.target)}
            aria-label={t.truco.reset}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className={styles.teamsGrid}>
        {/* Nosotros */}
        <div className={styles.teamColumn}>
          <div className={styles.teamHeader}>
            <span className={styles.teamName}>{t.truco.us}</span>
            <span className={styles.teamScoreBig}>{match.usScore}</span>
          </div>

          <div className={styles.matchesBox}>
            <span className={styles.sectionLabel}>{t.truco.malas}</span>
            <div className={styles.bundleGrid}>{renderBundles(usMalas)}</div>

            {is30 && (
              <>
                <span className={styles.sectionLabel} style={{ marginTop: 8 }}>
                  {t.truco.buenas}
                </span>
                <div className={styles.bundleGrid}>{renderBundles(usBuenas)}</div>
              </>
            )}
          </div>

          <div className={styles.controlsStack}>
            <div className={styles.quickRow}>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('us', 2)}>
                +2
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('us', 3)}>
                +3
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('us', 4)}>
                +4
              </button>
            </div>
            <button
              type="button"
              className={styles.mainPlusBtn}
              onClick={() => handleAdd('us', 1)}
            >
              +1
            </button>
          </div>
        </div>

        {/* Ellos */}
        <div className={styles.teamColumn}>
          <div className={styles.teamHeader}>
            <span className={styles.teamName}>{t.truco.them}</span>
            <span className={styles.teamScoreBig}>{match.themScore}</span>
          </div>

          <div className={styles.matchesBox}>
            <span className={styles.sectionLabel}>{t.truco.malas}</span>
            <div className={styles.bundleGrid}>{renderBundles(themMalas)}</div>

            {is30 && (
              <>
                <span className={styles.sectionLabel} style={{ marginTop: 8 }}>
                  {t.truco.buenas}
                </span>
                <div className={styles.bundleGrid}>{renderBundles(themBuenas)}</div>
              </>
            )}
          </div>

          <div className={styles.controlsStack}>
            <div className={styles.quickRow}>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('them', 2)}>
                +2
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('them', 3)}>
                +3
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('them', 4)}>
                +4
              </button>
            </div>
            <button
              type="button"
              className={styles.mainPlusBtn}
              onClick={() => handleAdd('them', 1)}
            >
              +1
            </button>
          </div>
        </div>
      </div>

      {/* Winner Celebration Modal */}
      {match.winner && (
        <div className={styles.overlay}>
          <Trophy size={54} color="var(--truco-gold)" />
          <h2 className={styles.modalTitle}>{t.truco.matchWon}</h2>
          <p className={styles.modalSub}>
            Ganó el equipo: <strong>{match.winner === 'us' ? t.truco.us : t.truco.them}</strong>
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => handleReset(match.target)}
          >
            {t.truco.revancha}
          </button>
        </div>
      )}
    </div>
  );
}
`,

  'src/app/App.tsx': `import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { GameScreen } from '@/features/game/GameScreen';
import { TrucoScreen } from '@/features/truco/TrucoScreen';
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
          <Route path="/game" element={<GameScreen />} />
          <Route path="/truco" element={<TrucoScreen />} />
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

  'GUIA.md': `# Guía Paso a Paso — TrucoBlock

- [x] Fase 0: Setup inicial
- [x] Fase 1: Design system (tokens, temas), layout, navegación inferior e Inicio
- [x] Fase 2: Lógica del juego (funciones puras + tests)
- [x] Fase 3: UI del juego: tablero, bandeja, drag & drop, vista previa
- [x] Fase 4: Pulido del juego: animaciones, combos, sonido, vibración, pausa, persistencia
- [x] Fase 5: Truco: lógica + tests + UI + palitos + historial
- [ ] Fase 6: Ajustes, estadísticas, compartir, i18n, accesibilidad
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

console.log('\n¡Fase 5 lista! Ejecutá npm run test para verificar los tests.');