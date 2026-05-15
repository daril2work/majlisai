// Pure formatting utilities — no React, no side effects.
// All functions are pure and independently testable.

const ID_LOCALE = 'id-ID';

/**
 * Format an ISO timestamp to a full Indonesian date string.
 * e.g. "Sabtu, 14 Mei 2026"
 */
export function formatEventDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return date.toLocaleDateString(ID_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format an ISO timestamp to a time string.
 * e.g. "19:30 WIB"
 */
export function formatEventTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString(ID_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' WIB';
}

/**
 * Format distance in meters to a human-readable string.
 * e.g. 1500 → "1.5 KM", 800 → "800 M"
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} KM`;
  }
  return `${Math.round(meters)} M`;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
