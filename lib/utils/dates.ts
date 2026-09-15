/**
 * Shared date formatting utilities for Ribolov BiH
 * Format strictly as: "15.09.2026. (Utorak)"
 * Uses explicit Bosnian weekday arrays to guarantee 100% hydration match between SSR and Client.
 */

const WEEKDAYS_FULL = [
  'Nedjelja',
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
];

const WEEKDAYS_SHORT = [
  'Ned',
  'Pon',
  'Uto',
  'Sri',
  'Čet',
  'Pet',
  'Sub',
];

/** Full format: "15.09.2026. (Utorak)" */
export function formatDateFull(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const weekday = WEEKDAYS_FULL[date.getDay()];
  return `${dd}.${mm}.${yyyy}. (${weekday})`;
}

/** Short format for almanac cards: "15.09.2026. Utorak" */
export function formatDateShort(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const weekday = WEEKDAYS_FULL[date.getDay()];
  return `${dd}.${mm}.${yyyy}. ${weekday}`;
}

/** Parse ISO date string (YYYY-MM-DD) and format as "15.09.2026. (Dan)" */
export function formatIsoDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day, 12, 0, 0);
  return formatDateFull(d);
}
