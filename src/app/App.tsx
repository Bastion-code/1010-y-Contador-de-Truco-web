import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { GameScreen } from '@/features/game/GameScreen';
import { TrucoScreen } from '@/features/truco/TrucoScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { useSettingsStore, applyThemeToDOM } from '@/features/settings/settingsStore';

export function App() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/truco" element={<TrucoScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
