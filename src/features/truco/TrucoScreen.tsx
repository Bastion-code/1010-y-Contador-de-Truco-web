import { useState, useEffect } from 'react';
import { Undo2, RotateCcw, Trophy } from 'lucide-react';
import { t } from '@/i18n';
import { useSettingsStore } from '@/features/settings/settingsStore';
import {
  createTrucoMatch,
  addPoints,
  undoTrucoMatch,
  type TargetScore,
  type TrucoMatchState,
} from './trucoEngine';
import { triggerHaptic } from '@/platform/haptics';
import styles from './TrucoScreen.module.css';

export function TrucoScreen() {
  const { trucoWinsUs, trucoWinsThem } = useSettingsStore();
  const [match, setMatch] = useState<TrucoMatchState>(() => createTrucoMatch(30));

  const handleAdd = (team: 'us' | 'them', pts: number) => {
    const next = addPoints(match, team, pts);
    triggerHaptic(20);

    if (next.winner && !match.winner) {
      if (next.winner === 'us') {
        useSettingsStore.setState({ trucoWinsUs: trucoWinsUs + 1 });
      } else {
        useSettingsStore.setState({ trucoWinsThem: trucoWinsThem + 1 });
      }
    }
    setMatch(next);
  };

  const handleUndo = () => {
    setMatch(undoTrucoMatch(match));
    triggerHaptic(10);
  };

  const handleReset = (target: TargetScore = match.target) => {
    setMatch(createTrucoMatch(target));
    triggerHaptic(15);
  };

  const renderBundles = (score: number) => {
    const bundlesCount = Math.ceil(score / 5);
    const bundles = [];

    for (let i = 0; i < bundlesCount; i++) {
      const sticksInBundle = Math.min(5, score - i * 5);
      bundles.push(
        <div key={i} className={styles.bundle}>
          {sticksInBundle >= 1 && <div className={`${styles.matchstick} ${styles.stick1}`} />}
          {sticksInBundle >= 2 && <div className={`${styles.matchstick} ${styles.stick2}`} />}
          {sticksInBundle >= 3 && <div className={`${styles.matchstick} ${styles.stick3}`} />}
          {sticksInBundle >= 4 && <div className={`${styles.matchstick} ${styles.stick4}`} />}
          {sticksInBundle === 5 && <div className={`${styles.matchstick} ${styles.stick5}`} />}
        </div>
      );
    }
    return bundles;
  };

  // Split score into Malas (0-15) and Buenas (15-30) when target is 30
  const is30 = match.target === 30;
  const usMalas = is30 ? Math.min(15, match.usScore) : match.usScore;
  const usBuenas = is30 ? Math.max(0, match.usScore - 15) : 0;
  const themMalas = is30 ? Math.min(15, match.themScore) : match.themScore;
  const themBuenas = is30 ? Math.max(0, match.themScore - 15) : 0;

  return (
    <div className={styles.screen}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.targetSelector}>
          <button
            type="button"
            className={`${styles.targetBtn} ${match.target === 15 ? styles.targetBtnActive : ''}`}
            onClick={() => handleReset(15)}
          >
            {t.truco.meta15}
          </button>
          <button
            type="button"
            className={`${styles.targetBtn} ${match.target === 30 ? styles.targetBtnActive : ''}`}
            onClick={() => handleReset(30)}
          >
            {t.truco.meta30}
          </button>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleUndo}
            disabled={match.history.length === 0}
            aria-label={t.truco.undo}
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => handleReset(match.target)}
            aria-label={t.truco.reset}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className={styles.teamsGrid}>
        {/* Nosotros */}
        <div className={styles.teamColumn}>
          <div className={styles.teamHeader}>
            <span className={styles.teamName}>{t.truco.us}</span>
            <span className={styles.teamScoreBig}>{match.usScore}</span>
          </div>

          <div className={styles.matchesBox}>
            <span className={styles.sectionLabel}>{t.truco.malas}</span>
            <div className={styles.bundleGrid}>{renderBundles(usMalas)}</div>

            {is30 && (
              <>
                <span className={styles.sectionLabel} style={{ marginTop: 8 }}>
                  {t.truco.buenas}
                </span>
                <div className={styles.bundleGrid}>{renderBundles(usBuenas)}</div>
              </>
            )}
          </div>

          <div className={styles.controlsStack}>
            <div className={styles.quickRow}>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('us', 2)}>
                +2
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('us', 3)}>
                +3
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('us', 4)}>
                +4
              </button>
            </div>
            <button
              type="button"
              className={styles.mainPlusBtn}
              onClick={() => handleAdd('us', 1)}
            >
              +1
            </button>
          </div>
        </div>

        {/* Ellos */}
        <div className={styles.teamColumn}>
          <div className={styles.teamHeader}>
            <span className={styles.teamName}>{t.truco.them}</span>
            <span className={styles.teamScoreBig}>{match.themScore}</span>
          </div>

          <div className={styles.matchesBox}>
            <span className={styles.sectionLabel}>{t.truco.malas}</span>
            <div className={styles.bundleGrid}>{renderBundles(themMalas)}</div>

            {is30 && (
              <>
                <span className={styles.sectionLabel} style={{ marginTop: 8 }}>
                  {t.truco.buenas}
                </span>
                <div className={styles.bundleGrid}>{renderBundles(themBuenas)}</div>
              </>
            )}
          </div>

          <div className={styles.controlsStack}>
            <div className={styles.quickRow}>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('them', 2)}>
                +2
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('them', 3)}>
                +3
              </button>
              <button type="button" className={styles.quickBtn} onClick={() => handleAdd('them', 4)}>
                +4
              </button>
            </div>
            <button
              type="button"
              className={styles.mainPlusBtn}
              onClick={() => handleAdd('them', 1)}
            >
              +1
            </button>
          </div>
        </div>
      </div>

      {/* Winner Celebration Modal */}
      {match.winner && (
        <div className={styles.overlay}>
          <Trophy size={54} color="var(--truco-gold)" />
          <h2 className={styles.modalTitle}>{t.truco.matchWon}</h2>
          <p className={styles.modalSub}>
            Ganó el equipo: <strong>{match.winner === 'us' ? t.truco.us : t.truco.them}</strong>
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => handleReset(match.target)}
          >
            {t.truco.revancha}
          </button>
        </div>
      )}
    </div>
  );
}
