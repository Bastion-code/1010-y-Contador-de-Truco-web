import { describe, it, expect } from 'vitest';
import { createTrucoMatch, addPoints, undoTrucoMatch } from './trucoEngine';

describe('Truco Engine', () => {
  it('initializes match correctly', () => {
    const match = createTrucoMatch(30);
    expect(match.usScore).toBe(0);
    expect(match.themScore).toBe(0);
    expect(match.winner).toBeNull();
    expect(match.target).toBe(30);
  });

  it('adds points and detects winner when target is reached', () => {
    let match = createTrucoMatch(15);
    match = addPoints(match, 'us', 12);
    expect(match.usScore).toBe(12);
    expect(match.winner).toBeNull();

    match = addPoints(match, 'us', 4);
    expect(match.usScore).toBe(15);
    expect(match.winner).toBe('us');
  });

  it('supports undoing last action', () => {
    let match = createTrucoMatch(30);
    match = addPoints(match, 'us', 3);
    match = addPoints(match, 'them', 2);
    expect(match.usScore).toBe(3);
    expect(match.themScore).toBe(2);

    match = undoTrucoMatch(match);
    expect(match.usScore).toBe(3);
    expect(match.themScore).toBe(0);
  });
});
