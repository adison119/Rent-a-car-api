import { DateTime } from 'luxon';

/**
 * Returns start of today (00:00:00) in the configured timezone or server local time.
 * Uses APP_TIMEZONE env (e.g. 'Asia/Bangkok') when set.
 */
export function getStartOfToday(): Date {
  const tz = process.env.APP_TIMEZONE ?? undefined;
  const dt = tz
    ? DateTime.now().setZone(tz).startOf('day')
    : DateTime.local().startOf('day');
  return dt.toJSDate();
}
