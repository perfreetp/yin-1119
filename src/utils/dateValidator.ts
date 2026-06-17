import dayjs from 'dayjs';

export function isValidBirthDate(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const parsed = dayjs(trimmed);
  if (!parsed.isValid()) return false;
  if (parsed.format('YYYY-MM-DD') !== trimmed) return false;
  if (parsed.isAfter(dayjs())) return false;
  if (parsed.isBefore(dayjs('1990-01-01'))) return false;
  return true;
}
