import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = ['src/platform', 'src/features/game'];

for (const dir of dirs) {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

const files = {
  'src/platform/audio.ts': `class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playPlace(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  playClear(linesCount: number): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const baseFreq = 440 + linesCount * 110;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playGameOver(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }
}

export const soundEngine = new SoundEngine();
`,

  'src/platform/haptics.ts': `export function triggerHaptic(pattern: number | number[] = 15): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if vibration is restricted by browser policy
    }
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
  placeholders: {
    trucoTitle: 'Anotador de Truco (Fase 5)',
    trucoDesc: 'Acá irá la mesa con paño verde y fósforos.',
    settingsTitle: 'Ajustes (Fase 6)',
    settingsDesc: 'Configuración de sonido, vibración, tema y datos.',
  },
} as const;

export type Dictionary = typeof esAR;
`,

  'src/features/game/gameStore.ts': `import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  createEmptyGrid,
  generateSmartTray,
  canPlacePiece,
  placePieceAndClear,
  isGameOver,
} from './engine';
import type { Grid, PieceInstance } from './types';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { soundEngine } from '@/platform/audio';
import { triggerHaptic } from '@/platform/haptics';
import { webStorage } from '@/platform';

interface GameState {
  grid: Grid;
  tray: [PieceInstance | null, PieceInstance | null, PieceInstance | null];
  score: number;
  combo: number;
  isOver: boolean;
  isPaused: boolean;
  startNewGame: () => void;
  pauseGame: (paused: boolean) => void;
  placeTrayPiece: (trayIndex: number, row: number, col: number) => boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      const initialGrid = createEmptyGrid();
      return {
        grid: initialGrid,
        tray: generateSmartTray(initialGrid),
        score: 0,
        combo: 0,
        isOver: false,
        isPaused: false,

        startNewGame: () => {
          const freshGrid = createEmptyGrid();
          set({
            grid: freshGrid,
            tray: generateSmartTray(freshGrid),
            score: 0,
            combo: 0,
            isOver: false,
            isPaused: false,
          });
          useSettingsStore.setState({ hasSavedGame: true });
        },

        pauseGame: (paused) => set({ isPaused: paused }),

        placeTrayPiece: (trayIndex, row, col) => {
          const { grid, tray, score, combo, isOver, isPaused } = get();
          if (isOver || isPaused) return false;

          const piece = tray[trayIndex];
          if (!piece) return false;

          if (!canPlacePiece(grid, piece.matrix, row, col)) {
            return false;
          }

          const result = placePieceAndClear(grid, piece, row, col, combo);
          const nextScore = score + result.pointsEarned;

          const settings = useSettingsStore.getState();
          if (settings.soundEnabled) {
            if (result.linesCleared > 0) {
              soundEngine.playClear(result.linesCleared);
            } else {
              soundEngine.playPlace();
            }
          }
          if (settings.hapticsEnabled) {
            triggerHaptic(result.linesCleared > 0 ? [30, 50, 30] : 15);
          }

          const nextTray: [PieceInstance | null, PieceInstance | null, PieceInstance | null] = [
            tray[0],
            tray[1],
            tray[2],
          ];
          nextTray[trayIndex] = null;

          const allUsed = nextTray.every((p) => p === null);
          const finalTray = allUsed ? generateSmartTray(result.grid) : nextTray;
          const gameEnded = isGameOver(result.grid, finalTray);

          if (gameEnded) {
            if (settings.soundEnabled) soundEngine.playGameOver();
            if (settings.hapticsEnabled) triggerHaptic([50, 100, 50, 100]);
          }

          if (nextScore > settings.highScore) {
            useSettingsStore.setState({ highScore: nextScore });
          }
          if (gameEnded) {
            useSettingsStore.setState({
              gamesPlayed: settings.gamesPlayed + 1,
              hasSavedGame: false,
            });
          } else {
            useSettingsStore.setState({ hasSavedGame: true });
          }

          set({
            grid: result.grid,
            tray: finalTray,
            score: nextScore,
            combo: result.newCombo,
            isOver: gameEnded,
          });

          return true;
        },
      };
    },
    {
      name: 'trucoblock-game',
      storage: createJSONStorage(() => webStorage),
    }
  )
);
`,

  'src/features/game/GameScreen.module.css': `.screen {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.hud {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--space-3);
  align-items: center;
}

.scoreCard {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-4);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.scoreLabel {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.scoreValue {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.15;
}

.bestValue {
  color: var(--color-warning);
}

.hudActions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.comboBadge {
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-2));
  color: #ffffff;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  animation: pulseBadge 0.3s ease;
}

@keyframes pulseBadge {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.iconBtn {
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
  transition: transform 0.12s ease;
}

.iconBtn:active {
  transform: scale(0.94);
}

/* Board */
.boardWrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2);
  box-shadow: var(--shadow-md);
  touch-action: none;
}

.boardGrid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 4px;
}

.cell {
  border-radius: 7px;
  background-color: var(--color-surface-2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  position: relative;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

.blockFilled {
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.2);
  animation: popBlock 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popBlock {
  0% { transform: scale(0.7); }
  100% { transform: scale(1); }
}

.color_red { background: linear-gradient(180deg, #ff758f 0%, var(--block-red) 100%); }
.color_orange { background: linear-gradient(180deg, #ffb266 0%, var(--block-orange) 100%); }
.color_yellow { background: linear-gradient(180deg, #ffe366 0%, var(--block-yellow) 100%); }
.color_green { background: linear-gradient(180deg, #5ce6ad 0%, var(--block-green) 100%); }
.color_cyan { background: linear-gradient(180deg, #72d6f5 0%, var(--block-cyan) 100%); }
.color_blue { background: linear-gradient(180deg, #7096ff 0%, var(--block-blue) 100%); }
.color_purple { background: linear-gradient(180deg, #c6a6ff 0%, var(--block-purple) 100%); }

.cellGhost {
  opacity: 0.48;
  transform: scale(0.95);
}

.cellWillClear {
  box-shadow: 0 0 0 2px var(--color-warning), inset 0 0 10px rgba(255, 217, 61, 0.75) !important;
  filter: brightness(1.22);
  animation: flashLine 0.4s infinite alternate;
}

@keyframes flashLine {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Modals & Overlays */
.overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(15, 18, 38, 0.88);
  backdrop-filter: blur(6px);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  z-index: 20;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.modalTitle {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
}

.modalSub {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  text-align: center;
  max-width: 280px;
}

.recordBadge {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background-color: var(--color-warning);
  color: #1b1e3a;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
}

.primaryBtn {
  width: 100%;
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
  transition: transform 0.12s ease;
}

.primaryBtn:active { transform: scale(0.98); }

.secondaryBtn {
  width: 100%;
  min-height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
}

/* Tray */
.tray {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  min-height: 116px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-3);
  box-shadow: var(--shadow-sm);
  touch-action: none;
}

.traySlot {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background-color: var(--color-surface-2);
  min-height: 92px;
  position: relative;
  touch-action: none;
}

.traySlotInteractive { cursor: grab; }
.traySlotDragging { opacity: 0.2; }
.traySlotDisabled { opacity: 0.35; }

.miniPieceGrid {
  display: grid;
  gap: 3px;
  pointer-events: none;
}

.miniCell { width: 15px; height: 15px; border-radius: 4px; }
.miniCellEmpty { background-color: transparent; }

.floatingPiece {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 100;
  will-change: transform;
}

.floatingGrid { display: grid; gap: 4px; }
`,

  'src/features/game/GameScreen.tsx': `import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Pause, Play, RotateCcw, Share2, Home } from 'lucide-react';
import { t } from '@/i18n';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { useGameStore } from './gameStore';
import {
  GRID_SIZE,
  canPlacePiece,
  canPieceFitAnywhere,
  getPreviewClearLines,
} from './engine';
import type { PieceInstance } from './types';
import styles from './GameScreen.module.css';

interface DragState {
  trayIndex: number;
  piece: PieceInstance;
  pointerId: number;
  clientX: number;
  clientY: number;
  liftY: number;
  cellSize: number;
  snapRow: number | null;
  snapCol: number | null;
}

export function GameScreen() {
  const {
    grid,
    tray,
    score,
    combo,
    isOver,
    isPaused,
    startNewGame,
    pauseGame,
    placeTrayPiece,
  } = useGameStore();
  const highScore = useSettingsStore((state) => state.highScore);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const computeBoardSnap = (
    clientX: number,
    clientY: number,
    liftY: number,
    piece: PieceInstance
  ) => {
    const boardEl = boardRef.current;
    if (!boardEl) return { row: null, col: null, cellSize: 38 };

    const rect = boardEl.getBoundingClientRect();
    const cellSize = rect.width / GRID_SIZE;

    const rows = piece.matrix.length;
    const cols = piece.matrix[0]?.length ?? 1;
    const pieceWidth = cols * cellSize;
    const pieceHeight = rows * cellSize;

    const pieceLeft = clientX - pieceWidth / 2;
    const pieceTop = clientY - liftY - pieceHeight / 2;

    const firstCellCenterX = pieceLeft + cellSize / 2;
    const firstCellCenterY = pieceTop + cellSize / 2;

    const col = Math.floor((firstCellCenterX - rect.left) / cellSize);
    const row = Math.floor((firstCellCenterY - rect.top) / cellSize);

    if (canPlacePiece(grid, piece.matrix, row, col)) {
      return { row, col, cellSize };
    }
    return { row: null, col: null, cellSize };
  };

  const handlePointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    trayIndex: number,
    piece: PieceInstance
  ) => {
    if (isOver || isPaused) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const liftY = e.pointerType === 'touch' ? 76 : 36;
    const { row, col, cellSize } = computeBoardSnap(
      e.clientX,
      e.clientY,
      liftY,
      piece
    );

    setDrag({
      trayIndex,
      piece,
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
      liftY,
      cellSize,
      snapRow: row,
      snapCol: col,
    });
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    e.preventDefault();

    const { row, col, cellSize } = computeBoardSnap(
      e.clientX,
      e.clientY,
      drag.liftY,
      drag.piece
    );

    setDrag((prev) =>
      prev
        ? {
            ...prev,
            clientX: e.clientX,
            clientY: e.clientY,
            cellSize,
            snapRow: row,
            snapCol: col,
          }
        : null
    );
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    e.preventDefault();

    if (drag.snapRow !== null && drag.snapCol !== null) {
      placeTrayPiece(drag.trayIndex, drag.snapRow, drag.snapCol);
    }

    setDrag(null);
  };

  const handleShare = async () => {
    const text = \`¡Hice \${score} puntos en TrucoBlock (Bloques 8x8)! 🧩\`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TrucoBlock', text });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const ghostCells = new Set<string>();
  let previewLines: { rows: number[]; cols: number[] } = { rows: [], cols: [] };

  if (drag && drag.snapRow !== null && drag.snapCol !== null) {
    const { matrix } = drag.piece;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          ghostCells.add(\`\${drag.snapRow + r},\${drag.snapCol + c}\`);
        }
      }
    }
    previewLines = getPreviewClearLines(grid, matrix, drag.snapRow, drag.snapCol);
  }

  const clearRowsSet = new Set(previewLines.rows);
  const clearColsSet = new Set(previewLines.cols);
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className={styles.screen}>
      {/* Top HUD */}
      <header className={styles.hud}>
        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>{t.game.score}</span>
          <span className={styles.scoreValue}>{score}</span>
        </div>

        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>{t.game.best}</span>
          <span className={\`\${styles.scoreValue} \${styles.bestValue}\`}>
            {Math.max(score, highScore)}
          </span>
        </div>

        <div className={styles.hudActions}>
          {combo > 0 && <span className={styles.comboBadge}>x{combo}</span>}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => pauseGame(true)}
            aria-label={t.game.pauseAria}
          >
            <Pause size={20} />
          </button>
        </div>
      </header>

      {/* 8x8 Board */}
      <section
        ref={boardRef}
        className={styles.boardWrapper}
        aria-label={t.game.boardAria}
      >
        <div className={styles.boardGrid}>
          {grid.map((rowCells, r) =>
            rowCells.map((cellColor, c) => {
              const key = \`\${r},\${c}\`;
              const isGhost = ghostCells.has(key);
              const willClear = clearRowsSet.has(r) || clearColsSet.has(c);

              const activeColor = cellColor ?? (isGhost ? drag?.piece.color : null);
              const colorClass = activeColor ? styles[\`color_\${activeColor}\`] : '';

              return (
                <div
                  key={key}
                  className={[
                    styles.cell,
                    activeColor ? styles.blockFilled : '',
                    colorClass,
                    isGhost && !cellColor ? styles.cellGhost : '',
                    willClear ? styles.cellWillClear : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              );
            })
          )}
        </div>

        {/* Pause Modal Overlay */}
        {isPaused && (
          <div className={styles.overlay}>
            <h2 className={styles.modalTitle}>{t.game.pauseTitle}</h2>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => pauseGame(false)}
            >
              <Play size={18} fill="currentColor" />
              {t.game.resume}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                pauseGame(false);
                startNewGame();
              }}
            >
              <RotateCcw size={18} style={{ marginRight: 8 }} />
              {t.game.restart}
            </button>
          </div>
        )}

        {/* Game Over Modal Overlay */}
        {isOver && (
          <div className={styles.overlay}>
            <h2 className={styles.modalTitle}>{t.game.gameOverTitle}</h2>
            {isNewRecord && (
              <span className={styles.recordBadge}>{t.game.newRecordBadge}</span>
            )}
            <p className={styles.modalSub}>
              {t.game.finalScore}: <strong>{score}</strong>
            </p>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={startNewGame}
            >
              <RotateCcw size={18} />
              {t.game.playAgain}
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleShare}
            >
              <Share2 size={18} style={{ marginRight: 8 }} />
              {copiedShare ? t.game.shareCopied : t.game.shareScore}
            </button>
          </div>
        )}
      </section>

      {/* 3-Piece Tray */}
      <section className={styles.tray} aria-label={t.game.trayAria}>
        {tray.map((piece, idx) => {
          if (!piece) {
            return <div key={idx} className={styles.traySlot} />;
          }

          const rows = piece.matrix.length;
          const cols = piece.matrix[0]?.length ?? 1;
          const isBeingDragged = drag?.trayIndex === idx;
          const fitsSomewhere = canPieceFitAnywhere(grid, piece.matrix);

          return (
            <div
              key={piece.uid}
              className={[
                styles.traySlot,
                styles.traySlotInteractive,
                isBeingDragged ? styles.traySlotDragging : '',
                !fitsSomewhere ? styles.traySlotDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onPointerDown={(e) => handlePointerDown(e, idx, piece)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              <div
                className={styles.miniPieceGrid}
                style={{
                  gridTemplateColumns: \`repeat(\${cols}, 15px)\`,
                  gridTemplateRows: \`repeat(\${rows}, 15px)\`,
                }}
              >
                {piece.matrix.map((rowArr, r) =>
                  rowArr.map((val, c) => (
                    <div
                      key={\`\${r}-\${c}\`}
                      className={
                        val === 1
                          ? \`\${styles.miniCell} \${styles.blockFilled} \${styles[\`color_\${piece.color}\`]}\`
                          : styles.miniCellEmpty
                      }
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Floating Piece under Pointer */}
      {drag && (
        <div
          className={styles.floatingPiece}
          style={{
            transform: \`translate3d(\${
              drag.clientX -
              ((drag.piece.matrix[0]?.length ?? 1) * drag.cellSize) / 2
            }px, \${
              drag.clientY -
              drag.liftY -
              (drag.piece.matrix.length * drag.cellSize) / 2
            }px, 0)\`,
          }}
        >
          <div
            className={styles.floatingGrid}
            style={{
              gridTemplateColumns: \`repeat(\${
                drag.piece.matrix[0]?.length ?? 1
              }, \${drag.cellSize - 4}px)\`,
              gridTemplateRows: \`repeat(\${drag.piece.matrix.length}, \${
                drag.cellSize - 4
              }px)\`,
            }}
          >
            {drag.piece.matrix.map((rowArr, r) =>
              rowArr.map((val, c) => (
                <div
                  key={\`float-\${r}-\${c}\`}
                  className={
                    val === 1
                      ? \`\${styles.cell} \${styles.blockFilled} \${styles[\`color_\${drag.piece.color}\`]}\`
                      : ''
                  }
                  style={{
                    width: drag.cellSize - 4,
                    height: drag.cellSize - 4,
                    opacity: val === 1 ? 0.95 : 0,
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`,

  'GUIA.md': `# Guía Paso a Paso — TrucoBlock

- [x] Fase 0: Setup inicial
- [x] Fase 1: Design system (tokens, temas), layout, navegación inferior e Inicio
- [x] Fase 2: Lógica del juego (funciones puras + tests)
- [x] Fase 3: UI del juego: tablero, bandeja, drag & drop, vista previa
- [x] Fase 4: Pulido del juego: animaciones, combos, sonido, vibración, pausa, persistencia
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
  console.log('[OK] Creado/Actualizado:', relativePath);
}

console.log('\n¡Fase 4 lista! Probá el sonido y las animaciones en el navegador.');