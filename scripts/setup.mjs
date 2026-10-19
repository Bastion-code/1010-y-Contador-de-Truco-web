import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = [
  'src/features/game',
  'src/features/truco',
];

for (const dir of dirs) {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

const files = {
  'src/features/game/GameScreen.tsx': `import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Pause, Play, RotateCcw, Share2 } from 'lucide-react';
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

  'src/features/truco/TrucoScreen.tsx': `import { useState } from 'react';
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
};

for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = join(process.cwd(), relativePath);
  writeFileSync(fullPath, content, 'utf8');
  console.log('[OK] Corregido:', relativePath);
}

console.log('\n¡Listo! Vuelve a ejecutar: npm run build');