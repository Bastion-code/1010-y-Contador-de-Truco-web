import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { GameScreen } from '@/features/game/GameScreen';
import { useSettingsStore, applyThemeToDOM } from '@/features/settings/settingsStore';
import { t } from '@/i18n';

function PlaceholderView({ title, desc }: { title: string; desc: string }) {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        marginTop: 'var(--space-4)',
      }}
    >
      <h2 style={{ marginBottom: 'var(--space-2)' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
    </section>
  );
}

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
          <Route
            path="/truco"
            element={
              <PlaceholderView
                title={t.placeholders.trucoTitle}
                desc={t.placeholders.trucoDesc}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderView
                title={t.placeholders.settingsTitle}
                desc={t.placeholders.settingsDesc}
              />
            }
          />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
