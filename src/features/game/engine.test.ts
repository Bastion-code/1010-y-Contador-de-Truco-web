import { describe, it, expect } from 'vitest';
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
