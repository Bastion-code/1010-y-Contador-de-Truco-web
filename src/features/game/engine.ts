import { BLOCK_COLORS, PIECE_CATALOG, countMatrixCells } from './pieces';
import type {
  BlockColor,
  Grid,
  MoveResult,
  PieceDefinition,
  PieceInstance,
  PieceMatrix,
} from './types';

export const GRID_SIZE = 8;
export const FULL_CLEAR_BONUS = 300;
export const LINE_BASE_POINTS = 10;

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function isGridEmpty(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== null) return false;
    }
  }
  return true;
}

export function canPlacePiece(
  grid: Grid,
  matrix: PieceMatrix,
  startRow: number,
  startCol: number
): boolean {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] !== 1) continue;
      const targetRow = startRow + r;
      const targetCol = startCol + c;

      if (
        targetRow < 0 ||
        targetRow >= GRID_SIZE ||
        targetCol < 0 ||
        targetCol >= GRID_SIZE
      ) {
        return false;
      }

      if (grid[targetRow][targetCol] !== null) {
        return false;
      }
    }
  }
  return true;
}

export function canPieceFitAnywhere(grid: Grid, matrix: PieceMatrix): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlacePiece(grid, matrix, r, c)) {
        return true;
      }
    }
  }
  return false;
}

export function getPreviewClearLines(
  grid: Grid,
  matrix: PieceMatrix,
  startRow: number,
  startCol: number
): { rows: number[]; cols: number[] } {
  if (!canPlacePiece(grid, matrix, startRow, startCol)) {
    return { rows: [], cols: [] };
  }

  const temp = cloneGrid(grid);
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        temp[startRow + r][startCol + c] = 'red';
      }
    }
  }

  const rows: number[] = [];
  const cols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (temp[r].every((cell) => cell !== null)) {
      rows.push(r);
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (temp[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) cols.push(c);
  }

  return { rows, cols };
}

export function calculateMoveScore(
  cellsPlaced: number,
  linesCleared: number,
  combo: number,
  isFullClear: boolean
): number {
  const lineBonus =
    linesCleared > 0 ? LINE_BASE_POINTS * linesCleared * linesCleared * combo : 0;
  const fullClearBonus = isFullClear && linesCleared > 0 ? FULL_CLEAR_BONUS : 0;
  return cellsPlaced + lineBonus + fullClearBonus;
}

export function placePieceAndClear(
  grid: Grid,
  piece: { matrix: PieceMatrix; color: BlockColor },
  startRow: number,
  startCol: number,
  currentCombo: number
): MoveResult {
  if (!canPlacePiece(grid, piece.matrix, startRow, startCol)) {
    throw new Error('Invalid piece placement');
  }

  const nextGrid = cloneGrid(grid);
  let cellsPlaced = 0;

  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (piece.matrix[r][c] === 1) {
        nextGrid[startRow + r][startCol + c] = piece.color;
        cellsPlaced++;
      }
    }
  }

  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (nextGrid[r].every((cell) => cell !== null)) {
      clearedRows.push(r);
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let fullCol = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (nextGrid[r][c] === null) {
        fullCol = false;
        break;
      }
    }
    if (fullCol) {
      clearedCols.push(c);
    }
  }

  for (const r of clearedRows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      nextGrid[r][c] = null;
    }
  }

  for (const c of clearedCols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      nextGrid[r][c] = null;
    }
  }

  const linesCleared = clearedRows.length + clearedCols.length;
  const newCombo = linesCleared > 0 ? currentCombo + 1 : 0;
  const fullClear = linesCleared > 0 && isGridEmpty(nextGrid);
  const pointsEarned = calculateMoveScore(
    cellsPlaced,
    linesCleared,
    newCombo,
    fullClear
  );

  return {
    grid: nextGrid,
    clearedRows,
    clearedCols,
    linesCleared,
    pointsEarned,
    newCombo,
    isFullClear: fullClear,
  };
}

export function isGameOver(
  grid: Grid,
  tray: readonly (PieceInstance | null)[]
): boolean {
  const remaining = tray.filter((p): p is PieceInstance => p !== null);
  if (remaining.length === 0) return false;

  return !remaining.some((piece) => canPieceFitAnywhere(grid, piece.matrix));
}

function createPieceInstance(
  def: PieceDefinition,
  randomFn: () => number,
  indexSuffix: number
): PieceInstance {
  const colorIndex = Math.floor(randomFn() * BLOCK_COLORS.length);
  const color = BLOCK_COLORS[colorIndex] ?? 'purple';
  const uid = `${def.id}_${Math.floor(randomFn() * 1e6)}_${indexSuffix}`;

  return {
    uid,
    defId: def.id,
    matrix: def.matrix,
    color,
    cellCount: countMatrixCells(def.matrix),
  };
}

/**
 * Generates 3 pieces and guarantees that at least 1 of them fits on the current
 * grid if any piece in PIECE_CATALOG can fit.
 */
export function generateSmartTray(
  grid: Grid,
  randomFn: () => number = Math.random
): [PieceInstance, PieceInstance, PieceInstance] {
  const pickRandomDef = (): PieceDefinition => {
    const idx = Math.floor(randomFn() * PIECE_CATALOG.length);
    return PIECE_CATALOG[idx] ?? PIECE_CATALOG[0];
  };

  const defs: [PieceDefinition, PieceDefinition, PieceDefinition] = [
    pickRandomDef(),
    pickRandomDef(),
    pickRandomDef(),
  ];

  const anyFits = defs.some((d) => canPieceFitAnywhere(grid, d.matrix));

  if (!anyFits) {
    const fittingCatalog = PIECE_CATALOG.filter((d) =>
      canPieceFitAnywhere(grid, d.matrix)
    );
    if (fittingCatalog.length > 0) {
      const replaceSlot = Math.floor(randomFn() * 3) as 0 | 1 | 2;
      const fitDef =
        fittingCatalog[Math.floor(randomFn() * fittingCatalog.length)] ??
        fittingCatalog[0];
      defs[replaceSlot] = fitDef;
    }
  }

  return [
    createPieceInstance(defs[0], randomFn, 0),
    createPieceInstance(defs[1], randomFn, 1),
    createPieceInstance(defs[2], randomFn, 2),
  ];
}
