import { create } from 'zustand';
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
