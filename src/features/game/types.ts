export type BlockColor =
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
