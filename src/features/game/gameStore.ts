import { create } from 'zustand';
import {
  createEmptyGrid,
  generateSmartTray,
  canPlacePiece,
  placePieceAndClear,
  isGameOver,
} from './engine';
import type { Grid, PieceInstance } from './types';
import { useSettingsStore } from '@/features/settings/settingsStore';

interface GameState {
  grid: Grid;
  tray: [PieceInstance | null, PieceInstance | null, PieceInstance | null];
  score: number;
  combo: number;
  isOver: boolean;
  startNewGame: () => void;
  placeTrayPiece: (trayIndex: number, row: number, col: number) => boolean;
}

export const useGameStore = create<GameState>()((set, get) => {
  const initialGrid = createEmptyGrid();
  return {
    grid: initialGrid,
    tray: generateSmartTray(initialGrid),
    score: 0,
    combo: 0,
    isOver: false,

    startNewGame: () => {
      const freshGrid = createEmptyGrid();
      set({
        grid: freshGrid,
        tray: generateSmartTray(freshGrid),
        score: 0,
        combo: 0,
        isOver: false,
      });
    },

    placeTrayPiece: (trayIndex, row, col) => {
      const { grid, tray, score, combo, isOver } = get();
      if (isOver) return false;

      const piece = tray[trayIndex];
      if (!piece) return false;

      if (!canPlacePiece(grid, piece.matrix, row, col)) {
        return false;
      }

      const result = placePieceAndClear(grid, piece, row, col, combo);
      const nextScore = score + result.pointsEarned;

      const nextTray: [PieceInstance | null, PieceInstance | null, PieceInstance | null] = [
        tray[0],
        tray[1],
        tray[2],
      ];
      nextTray[trayIndex] = null;

      const allUsed = nextTray.every((p) => p === null);
      const finalTray = allUsed ? generateSmartTray(result.grid) : nextTray;
      const gameEnded = isGameOver(result.grid, finalTray);

      // Sync high score and games played with global settings
      const settings = useSettingsStore.getState();
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
});
