import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { webStorage } from '@/platform';

export type ThemeMode = 'dark' | 'light' | 'auto';

interface SettingsState {
  theme: ThemeMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  wakeLockEnabled: boolean;
  highScore: number;
  gamesPlayed: number;
  hasSavedGame: boolean;
  trucoWinsUs: number;
  trucoWinsThem: number;
  setTheme: (theme: ThemeMode) => void;
  toggleQuickTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      soundEnabled: true,
      hapticsEnabled: true,
      wakeLockEnabled: true,
      highScore: 0,
      gamesPlayed: 0,
      hasSavedGame: false,
      trucoWinsUs: 0,
      trucoWinsThem: 0,
      setTheme: (theme) => set({ theme }),
      toggleQuickTheme: () => {
        const current = get().theme;
        set({ theme: current === 'light' ? 'dark' : 'light' });
      },
    }),
    {
      name: 'trucoblock-settings',
      storage: createJSONStorage(() => webStorage),
    }
  )
);

export function applyThemeToDOM(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
