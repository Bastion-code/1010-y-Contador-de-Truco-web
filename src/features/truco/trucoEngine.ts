export type TargetScore = 15 | 30;

export interface TrucoMatchState {
  target: TargetScore;
  usScore: number;
  themScore: number;
  winner: 'us' | 'them' | null;
  history: { us: number; them: number }[];
}

export function createTrucoMatch(target: TargetScore = 30): TrucoMatchState {
  return {
    target,
    usScore: 0,
    themScore: 0,
    winner: null,
    history: [],
  };
}

export function addPoints(
  state: TrucoMatchState,
  team: 'us' | 'them',
  points: number
): TrucoMatchState {
  if (state.winner !== null) return state;

  const currentUs = state.usScore;
  const currentThem = state.themScore;

  const nextUs = team === 'us' ? Math.min(state.target, currentUs + points) : currentUs;
  const nextThem = team === 'them' ? Math.min(state.target, currentThem + points) : currentThem;

  let winner: 'us' | 'them' | null = null;
  if (nextUs >= state.target) winner = 'us';
  else if (nextThem >= state.target) winner = 'them';

  return {
    ...state,
    usScore: nextUs,
    themScore: nextThem,
    winner,
    history: [...state.history, { us: currentUs, them: currentThem }],
  };
}

export function undoTrucoMatch(state: TrucoMatchState): TrucoMatchState {
  if (state.history.length === 0) return state;
  const lastState = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  return {
    ...state,
    usScore: lastState.us,
    themScore: lastState.them,
    winner: null,
    history: newHistory,
  };
}
