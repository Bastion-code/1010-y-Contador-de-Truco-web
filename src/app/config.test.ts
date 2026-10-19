import { describe, it, expect } from 'vitest';
import { APP_NAME } from './config';

describe('App Config', () => {
  it('defines a single non-empty APP_NAME constant', () => {
    expect(APP_NAME).toBe('TrucoBlock');
  });
});
