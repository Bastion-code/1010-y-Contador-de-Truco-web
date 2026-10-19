import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Club, Settings } from 'lucide-react';
import { t } from '@/i18n';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navItems = [
    { to: '/', label: t.nav.home, icon: Home, end: true },
    { to: '/game', label: t.nav.game, icon: Grid },
    { to: '/truco', label: t.nav.truco, icon: Club },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <div className={styles.shell}>
      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav} aria-label={t.nav.ariaLabel}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            <span className={styles.indicator} />
            <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
