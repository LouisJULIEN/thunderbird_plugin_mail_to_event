import moment from 'moment-timezone';
import dictionary from 'relative-date-names';

export default (subject: string, locale: string, timezone: string): string | null => {
  const translation = (dictionary as Record<string, { day: { relative: { yesterday: string; today: string; tomorrow: string } } }>)[locale];

  if (!translation) {
    throw new Error('No translation available for the target locale.');
  }

  if (timezone && !moment.tz.zone(timezone)) {
    throw new Error('Unrecognized timezone.');
  }

  const normalizedSubject = subject.toLowerCase();

  const now = moment();

  if (normalizedSubject === translation.day.relative.yesterday) {
    return now.subtract(1, 'day').format('YYYY-MM-DD');
  }

  if (normalizedSubject === translation.day.relative.today) {
    return now.format('YYYY-MM-DD');
  }

  if (normalizedSubject === translation.day.relative.tomorrow) {
    return now.add(1, 'day').format('YYYY-MM-DD');
  }

  return null;
};
