import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatExpiry } from './FileRow';

// Pin "today" to 2024-06-15 for all tests
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-06-15T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatExpiry', () => {
  it('returns "Expiré" for a past date', () => {
    expect(formatExpiry('2024-06-14T00:00:00')).toBe('Expiré');
  });

  it('returns "Expire aujourd\'hui" when the date is today', () => {
    expect(formatExpiry('2024-06-15T23:59:59')).toBe("Expire aujourd'hui");
  });

  it('returns "Expire demain" when the date is tomorrow', () => {
    expect(formatExpiry('2024-06-16T00:00:00')).toBe('Expire demain');
  });

  it('returns "Expire dans N jours" for a future date', () => {
    expect(formatExpiry('2024-06-20T00:00:00')).toBe('Expire dans 5 jours');
  });
});
