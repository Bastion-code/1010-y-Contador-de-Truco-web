import type { BlockColor, PieceDefinition, PieceMatrix } from './types';

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
