import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = ['src/features/game'];

for (const dir of dirs) {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

const files = {
  'src/features/game/types.ts': `export type BlockColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple';

export type CellValue = BlockColor | null;

export type Grid = CellValue[][];

export type PieceMatrix = readonly (readonly number[])[];

export interface PieceDefinition {
  id: string;
  matrix: PieceMatrix;
}

export interface PieceInstance {
  uid: string;
  defId: string;
  matrix: PieceMatrix;
  color: BlockColor;
  cellCount: number;
}

export interface MoveResult {
  grid: Grid;
  clearedRows: number[];
  clearedCols: number[];
  linesCleared: number;
  pointsEarned: number;
  newCombo: number;
  isFullClear: boolean;
}
`,

  'src/features/game/pieces.ts': `import type { BlockColor, PieceDefinition, PieceMatrix } from './types';

export const BLOCK_COLORS: readonly BlockColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'purple',
];

export function countMatrixCells(matrix: PieceMatrix): number {
  let count = 0;
  for (const row of matrix) {
    for (const cell of row) {
      if (cell === 1) count++;
    }
  }
  return count;
}

export const PIECE_CATALOG: readonly PieceDefinition[] = [
  // 1x1 Dot
  { id: 'dot_1x1', matrix: [[1]] },

  // Horizontal Lines (1x2 to 1x5)
  { id: 'line_h2', matrix: [[1, 1]] },
  { id: 'line_h3', matrix: [[1, 1, 1]] },
  { id: 'line_h4', matrix: [[1, 1, 1, 1]] },
  { id: 'line_h5', matrix: [[1, 1, 1, 1, 1]] },

  // Vertical Lines (2x1 to 5x1)
  { id: 'line_v2', matrix: [[1], [1]] },
  { id: 'line_v3', matrix: [[1], [1], [1]] },
  { id: 'line_v4', matrix: [[1], [1], [1], [1]] },
  { id: 'line_v5', matrix: [[1], [1], [1], [1], [1]] },

  // Squares (2x2 & 3x3)
  {
    id: 'sq_2x2',
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'sq_3x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },

  // Rectangles (2x3 & 3x2)
  {
    id: 'rect_2x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  {
    id: 'rect_3x2',
    matrix: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
  },

  // Small 2x2 L / J Corners
  {
    id: 'corner_tl',
    matrix: [
      [1, 1],
      [1, 0],
    ],
  },
  {
    id: 'corner_tr',
    matrix: [
      [1, 1],
      [0, 1],
    ],
  },
  {
    id: 'corner_bl',
    matrix: [
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: 'corner_br',
    matrix: [
      [0, 1],
      [1, 1],
    ],
  },

  // Standard 3x2 L & J
  {
    id: 'l_right',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: 'j_left',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  },
  {
    id: 'l_up',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
    ],
  },
  {
    id: 'j_up',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
    ],
  },

  // Big 3x3 L / J Corners
  {
    id: 'big_corner_tl',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
  },
  {
    id: 'big_corner_tr',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
  },
  {
    id: 'big_corner_bl',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    id: 'big_corner_br',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
  },

  // T Shapes
  {
    id: 't_down',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    id: 't_up',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  {
    id: 't_right',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
  },
  {
    id: 't_left',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
  },

  // S & Z Shapes
  {
    id: 's_h',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    id: 'z_h',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    id: 's_v',
    matrix: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  },
  {
    id: 'z_v',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  },
];
`,

  'src/features/game/engine.ts': `import { BLOCK_COLORS, PIECE_CATALOG, countMatrixCells } from './pieces';
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
  const uid = \`\${def.id}_\${Math.floor(randomFn() * 1e6)}_\${indexSuffix}\`;

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
`,

  'src/features/game/engine.test.ts': `import { describe, it, expect } from 'vitest';
import {
  GRID_SIZE,
  createEmptyGrid,
  canPlacePiece,
  placePieceAndClear,
  getPreviewClearLines,
  generateSmartTray,
  isGameOver,
} from './engine';
import { PIECE_CATALOG } from './pieces';
import type { PieceInstance } from './types';

describe('Block Puzzle Pure Engine', () => {
  it('creates an 8x8 empty grid', () => {
    const grid = createEmptyGrid();
    expect(grid.length).toBe(GRID_SIZE);
    expect(grid.every((row) => row.length === GRID_SIZE)).toBe(true);
    expect(grid.flat().every((cell) => cell === null)).toBe(true);
  });

  it('validates piece bounds and cell collisions', () => {
    const grid = createEmptyGrid();
    const sq2x2 = [
      [1, 1],
      [1, 1],
    ];

    expect(canPlacePiece(grid, sq2x2, 0, 0)).toBe(true);
    expect(canPlacePiece(grid, sq2x2, 6, 6)).toBe(true);
    // Out of bounds at bottom-right edge
    expect(canPlacePiece(grid, sq2x2, 7, 7)).toBe(false);

    // Collision check
    grid[0][1] = 'blue';
    expect(canPlacePiece(grid, sq2x2, 0, 0)).toBe(false);
  });

  it('clears a full row and column simultaneously and calculates quadratic score', () => {
    const grid = createEmptyGrid();

    // Fill row 0 and col 0 except (0,0)
    for (let i = 1; i < GRID_SIZE; i++) {
      grid[0][i] = 'red';
      grid[i][0] = 'green';
    }
    // Add one extra block at (4,4) so it is NOT a full clear
    grid[4][4] = 'yellow';

    const preview = getPreviewClearLines(grid, [[1]], 0, 0);
    expect(preview.rows).toEqual([0]);
    expect(preview.cols).toEqual([0]);

    // Place 1x1 dot at (0,0) with currentCombo = 0 -> newCombo = 1
    // C = 1, L = 2 (1 row + 1 col), K = 1 => 1 + (10 * 2^2) * 1 = 41
    const result = placePieceAndClear(
      grid,
      { matrix: [[1]], color: 'cyan' },
      0,
      0,
      0
    );

    expect(result.clearedRows).toEqual([0]);
    expect(result.clearedCols).toEqual([0]);
    expect(result.linesCleared).toBe(2);
    expect(result.newCombo).toBe(1);
    expect(result.isFullClear).toBe(false);
    expect(result.pointsEarned).toBe(41);
    expect(result.grid[0].every((c) => c === null)).toBe(true);
  });

  it('awards consecutive combo multiplier and +300 Full Clear bonus', () => {
    const grid = createEmptyGrid();
    // Fill row 3 except last 2 cells
    for (let c = 0; c < GRID_SIZE - 2; c++) {
      grid[3][c] = 'purple';
    }

    // Place a 1x2 horizontal line at (3, 6) with previous combo = 2 (so newCombo = 3)
    // C = 2, L = 1, K = 3 => 2 + (10 * 1^2 * 3) + 300 (full clear) = 332
    const result = placePieceAndClear(
      grid,
      { matrix: [[1, 1]], color: 'orange' },
      3,
      6,
      2
    );

    expect(result.linesCleared).toBe(1);
    expect(result.newCombo).toBe(3);
    expect(result.isFullClear).toBe(true);
    expect(result.pointsEarned).toBe(332);
  });

  it('resets combo to 0 when a placement does not clear any line', () => {
    const grid = createEmptyGrid();
    const result = placePieceAndClear(
      grid,
      { matrix: [[1, 1]], color: 'blue' },
      2,
      2,
      4
    );

    expect(result.linesCleared).toBe(0);
    expect(result.newCombo).toBe(0);
    expect(result.pointsEarned).toBe(2);
  });

  it('guarantees at least one playable piece in generateSmartTray when space is tight', () => {
    const grid = createEmptyGrid();
    // Fill entire board except a single 1x1 cell at (7,7)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (r === 7 && c === 7) continue;
        grid[r][c] = 'red';
      }
    }

    // Force randomFn to return 0.5 (which normally picks a big piece, not dot_1x1)
    const tray = generateSmartTray(grid, () => 0.5);
    expect(tray.length).toBe(3);
    expect(tray.some((p) => p.defId === 'dot_1x1')).toBe(true);
    expect(isGameOver(grid, tray)).toBe(false);
  });

  it('detects Game Over when no remaining tray piece can fit', () => {
    const grid = createEmptyGrid();
    // Leave only a 1x1 hole at (0,0)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (r === 0 && c === 0) continue;
        grid[r][c] = 'blue';
      }
    }

    const sq3x3 = PIECE_CATALOG.find((p) => p.id === 'sq_3x3')!;
    const unplayablePiece: PieceInstance = {
      uid: 'test_1',
      defId: sq3x3.id,
      matrix: sq3x3.matrix,
      color: 'red',
      cellCount: 9,
    };

    expect(isGameOver(grid, [unplayablePiece, null, null])).toBe(true);
  });
});
`,

  'GUIA.md': `# Guía Paso a Paso — TrucoBlock

- [x] Fase 0: Setup inicial
- [x] Fase 1: Design system (tokens, temas), layout, navegación inferior e Inicio
- [x] Fase 2: Lógica del juego (funciones puras + tests)
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
  console.log('[OK] Creado/Actualizado:', relativePath);
}

console.log('\n¡Fase 2 lista! Ejecutá: npm run test');