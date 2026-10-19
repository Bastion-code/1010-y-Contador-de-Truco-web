import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Club, Sun, Moon } from 'lucide-react';
import { t } from '@/i18n';
import { useSettingsStore } from '@/features/settings/settingsStore';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const navigate = useNavigate();
  const {
    theme,
    toggleQuickTheme,
    highScore,
    gamesPlayed,
    hasSavedGame,
    trucoWinsUs,
    trucoWinsThem,
  } = useSettingsStore();

  return (
    <div className={styles.container}>
      {/* Top Header with Logo & Theme Toggle */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoBox} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="3" width="10" height="10" rx="3" fill="#FFD93D" />
              <rect x="15" y="3" width="10" height="10" rx="3" fill="#FF5C7A" />
              <rect x="3" y="15" width="10" height="10" rx="3" fill="#3DDC97" />
              <rect x="15" y="15" width="10" height="10" rx="3" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>{t.app.name}</h1>
            <p className={styles.subtitle}>{t.app.subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.themeBtn}
          onClick={toggleQuickTheme}
          aria-label={t.home.toggleThemeAria}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Main Feature Cards */}
      <div className={styles.cardsGrid}>
        {/* Card 1: Block Puzzle */}
        <section className={`${styles.card} ${styles.cardGame}`}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.badge}>{t.home.gameCard.badge}</span>
              <h2 className={styles.cardTitle}>{t.home.gameCard.title}</h2>
            </div>
            <Trophy size={28} color="var(--color-warning)" aria-hidden="true" />
          </div>

          <p className={styles.cardDesc}>{t.home.gameCard.description}</p>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{t.home.gameCard.highScoreLabel}</span>
            <span className={styles.metaValue}>{highScore} pts</span>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => navigate('/game')}
            >
              <Play size={18} fill="currentColor" />
              {t.home.gameCard.playNew}
            </button>
            {hasSavedGame && (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => navigate('/game')}
              >
                {t.home.gameCard.continueGame}
              </button>
            )}
          </div>
        </section>

        {/* Card 2: Truco Scorekeeper */}
        <section className={`${styles.card} ${styles.cardTruco}`}>
          <div className={styles.cardHeader}>
            <div>
              <span className={`${styles.badge} ${styles.badgeTruco}`}>
                {t.home.trucoCard.badge}
              </span>
              <h2 className={styles.cardTitle}>{t.home.trucoCard.title}</h2>
            </div>
            <Club size={28} color="var(--truco-us)" aria-hidden="true" />
          </div>

          <p className={styles.cardDesc}>{t.home.trucoCard.description}</p>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{t.home.trucoCard.statusLabel}</span>
            <span className={styles.metaValue} style={{ color: 'var(--truco-us)' }}>
              {t.home.trucoCard.noActiveMatch}
            </span>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={`${styles.primaryBtn} ${styles.trucoBtn}`}
              onClick={() => navigate('/truco')}
            >
              <Club size={18} />
              {t.home.trucoCard.openTable}
            </button>
          </div>
        </section>
      </div>

      {/* Compact Stats Block */}
      <section className={styles.statsSection} aria-labelledby="stats-heading">
        <h3 id="stats-heading" className={styles.statsTitle}>
          {t.home.stats.title}
        </h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{highScore}</span>
            <span className={styles.statLabel}>{t.home.stats.bestScore}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{gamesPlayed}</span>
            <span className={styles.statLabel}>{t.home.stats.gamesPlayed}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: 'var(--truco-us)' }}>
              {trucoWinsUs}
            </span>
            <span className={styles.statLabel}>{t.home.stats.trucoWinsUs}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: 'var(--truco-them)' }}>
              {trucoWinsThem}
            </span>
            <span className={styles.statLabel}>{t.home.stats.trucoWinsThem}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
