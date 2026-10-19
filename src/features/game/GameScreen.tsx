import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
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
  const { grid, tray, score, combo, isOver, startNewGame, placeTrayPiece } =
    useGameStore();
  const highScore = useSettingsStore((state) => state.highScore);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const computeBoardSnap = (
    clientX: number,
    clientY: number,
    liftY: number,
    piece: PieceInstance
  ): { row: number | null; col: number | null; cellSize: number } => {
    const boardEl = boardRef.current;
    if (!boardEl) return { row: null, col: null, cellSize: 38 };

    const rect = boardEl.getBoundingClientRect();
    const cellSize = rect.width / GRID_SIZE;

    const rows = piece.matrix.length;
    const cols = piece.matrix[0]?.length ?? 1;
    const pieceWidth = cols * cellSize;
    const pieceHeight = rows * cellSize;

    // Top-left corner of the floating piece
    const pieceLeft = clientX - pieceWidth / 2;
    const pieceTop = clientY - liftY - pieceHeight / 2;

    // Center of cell (0,0) of the piece
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
    if (isOver) return;
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

  // Compute ghost cells & line clear preview when snapped
  const ghostCells = new Set<string>();
  let previewLines: { rows: number[]; cols: number[] } = { rows: [], cols: [] };

  if (drag && drag.snapRow !== null && drag.snapCol !== null) {
    const { matrix } = drag.piece;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          ghostCells.add(`${drag.snapRow + r},${drag.snapCol + c}`);
        }
      }
    }
    previewLines = getPreviewClearLines(
      grid,
      matrix,
      drag.snapRow,
      drag.snapCol
    );
  }

  const clearRowsSet = new Set(previewLines.rows);
  const clearColsSet = new Set(previewLines.cols);

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
          <span className={`${styles.scoreValue} ${styles.bestValue}`}>
            {Math.max(score, highScore)}
          </span>
        </div>

        <div className={styles.hudActions}>
          {combo > 0 && (
            <span className={styles.comboBadge}>x{combo}</span>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={startNewGame}
            aria-label={t.game.restartAria}
          >
            <RotateCcw size={20} />
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
              const key = `${r},${c}`;
              const isGhost = ghostCells.has(key);
              const willClear = clearRowsSet.has(r) || clearColsSet.has(c);

              const activeColor = cellColor ?? (isGhost ? drag?.piece.color : null);
              const colorClass = activeColor ? styles[`color_${activeColor}`] : '';

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

        {isOver && (
          <div className={styles.overBanner}>
            <span className={styles.overBadge}>{t.game.gameOverBadge}</span>
            <button
              type="button"
              className={styles.newGameBtn}
              onClick={startNewGame}
            >
              {t.game.newGameBtn}
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
                  gridTemplateColumns: `repeat(${cols}, 15px)`,
                  gridTemplateRows: `repeat(${rows}, 15px)`,
                }}
              >
                {piece.matrix.map((rowArr, r) =>
                  rowArr.map((val, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={
                        val === 1
                          ? `${styles.miniCell} ${styles.blockFilled} ${styles[`color_${piece.color}`]}`
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
            transform: `translate3d(${
              drag.clientX -
              ((drag.piece.matrix[0]?.length ?? 1) * drag.cellSize) / 2
            }px, ${
              drag.clientY -
              drag.liftY -
              (drag.piece.matrix.length * drag.cellSize) / 2
            }px, 0)`,
          }}
        >
          <div
            className={styles.floatingGrid}
            style={{
              gridTemplateColumns: `repeat(${
                drag.piece.matrix[0]?.length ?? 1
              }, ${drag.cellSize - 4}px)`,
              gridTemplateRows: `repeat(${drag.piece.matrix.length}, ${
                drag.cellSize - 4
              }px)`,
            }}
          >
            {drag.piece.matrix.map((rowArr, r) =>
              rowArr.map((val, c) => (
                <div
                  key={`float-${r}-${c}`}
                  className={
                    val === 1
                      ? `${styles.cell} ${styles.blockFilled} ${styles[`color_${drag.piece.color}`]}`
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
