import { useState } from 'react';
import { Trash2, Info } from 'lucide-react';
import { t } from '@/i18n';
import { useSettingsStore, type ThemeMode } from './settingsStore';
import styles from './SettingsScreen.module.css';

export function SettingsScreen() {
  const {
    theme,
    setTheme,
    soundEnabled,
    hapticsEnabled,
    setSoundEnabled,
    setHapticsEnabled,
    resetAllData,
  } = useSettingsStore();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetConfirm = () => {
    resetAllData();
    setShowConfirm(false);
  };

  return (
    <div className={styles.screen}>
      <h2 className={styles.sectionTitle}>{t.settings.title}</h2>

      {/* Preferences Group */}
      <div className={styles.group}>
        {/* Sound */}
        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>{t.settings.sound}</span>
            <span className={styles.itemDesc}>{t.settings.soundDesc}</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        {/* Haptics */}
        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>{t.settings.haptics}</span>
            <span className={styles.itemDesc}>{t.settings.hapticsDesc}</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={hapticsEnabled}
              onChange={(e) => setHapticsEnabled(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        {/* Theme Select */}
        <div className={styles.item}>
          <div className={styles.itemInfo}>
            <span className={styles.itemLabel}>{t.settings.theme}</span>
          </div>
          <select
            className={styles.select}
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeMode)}
          >
            <option value="dark">{t.settings.themeDark}</option>
            <option value="light">{t.settings.themeLight}</option>
            <option value="auto">{t.settings.themeAuto}</option>
          </select>
        </div>
      </div>

      {/* Data Management Group */}
      <div className={styles.group}>
        <div className={styles.itemInfo}>
          <span className={styles.itemLabel}>{t.settings.data}</span>
        </div>
        <button
          type="button"
          className={styles.dangerBtn}
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 size={18} />
          {t.settings.resetData}
        </button>
      </div>

      {/* About Group */}
      <div className={styles.group}>
        <div className={styles.item}>
          <div className={styles.aboutBox}>
            <span className={styles.itemLabel}>{t.app.name}</span>
            <span className={styles.version}>{t.app.version}</span>
            <span className={styles.itemDesc}>{t.settings.credits}</span>
          </div>
          <Info size={24} color="var(--color-text-muted)" />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 style={{ fontFamily: 'var(--font-display)' }}>{t.settings.resetData}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {t.settings.resetConfirm}
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
              >
                {t.settings.cancel}
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleResetConfirm}
              >
                {t.settings.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
