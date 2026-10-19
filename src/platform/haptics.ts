export function triggerHaptic(pattern: number | number[] = 15): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if vibration is restricted by browser policy
    }
  }
}
