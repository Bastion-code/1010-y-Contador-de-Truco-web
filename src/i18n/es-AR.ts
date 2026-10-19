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
  placeholders: {
    gameTitle: 'Módulo de Juego (Fase 2 y 3)',
    gameDesc: 'Acá vamos a construir el tablero 8x8 con drag & drop.',
    trucoTitle: 'Anotador de Truco (Fase 5)',
    trucoDesc: 'Acá irá la mesa con paño verde y fósforos.',
    settingsTitle: 'Ajustes (Fase 6)',
    settingsDesc: 'Configuración de sonido, vibración, tema y datos.',
  },
} as const;

export type Dictionary = typeof esAR;
