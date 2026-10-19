import { APP_NAME } from '@/app/config';

export const esAR = {
  app: {
    name: APP_NAME,
    subtitle: 'Bloques + Truco Argentino',
  },
  nav: {
    home: 'Inicio',
    game: 'Juego',
    truco: 'Truco',
    settings: 'Ajustes',
    ariaLabel: 'Navegación principal',
  },
  home: {
    toggleThemeAria: 'Cambiar tema claro u oscuro',
    gameCard: {
      badge: 'PUZZLE 8x8',
      title: 'Bloques',
      description: 'Ubicá piezas, limpiá filas y columnas y armá combos.',
      highScoreLabel: 'Récord',
      playNew: 'Jugar ahora',
      continueGame: 'Continuar partida',
    },
    trucoCard: {
      badge: 'ANOTADOR',
      title: 'Truco Argentino',
      description: 'Paño tradicional con fósforos, buenas y malas.',
      statusLabel: 'Estado',
      noActiveMatch: 'Mesa lista (a 30 pts)',
      openTable: 'Abrir anotador',
    },
    stats: {
      title: 'Tus Estadísticas',
      bestScore: 'Mejor Puntaje',
      gamesPlayed: 'Partidas Bloques',
      trucoWinsUs: 'Victorias Nosotros',
      trucoWinsThem: 'Victorias Ellos',
    },
  },
  game: {
    score: 'Puntaje',
    best: 'Récord',
    combo: 'Combo',
    restartAria: 'Reiniciar partida',
    boardAria: 'Tablero de bloques 8 por 8',
    trayAria: 'Bandeja de piezas disponibles',
    gameOverBadge: 'SIN JUGADAS POSIBLES',
    newGameBtn: 'Jugar de nuevo',
  },
  placeholders: {
    trucoTitle: 'Anotador de Truco (Fase 5)',
    trucoDesc: 'Acá irá la mesa con paño verde y fósforos.',
    settingsTitle: 'Ajustes (Fase 6)',
    settingsDesc: 'Configuración de sonido, vibración, tema y datos.',
  },
} as const;

export type Dictionary = typeof esAR;
