import {
  format as formatDate,
  parse as parseDate,
  isValid as isValidDate,
} from 'date-fns';
import { enUS as dateFnsLocale } from 'date-fns/locale';
import moment from 'moment-timezone';
import dictionary from 'relative-date-names';
import createMovingChunks from '@/createMovingChunks';
import extractRelativeDate from '@/extractRelativeDate';
import createFormats from '@/createFormats';
import normalizeInput from '@/normalizeInput';
import { replaceMonthName, replaceDayName } from '@/resolveLocalizedNames';
import monthsData from '@/months.json';
import type {
  ConfigurationType,
  DateMatchType,
  UserConfigurationType,
} from '@/types';

const defaultConfiguration: ConfigurationType = {
  maximumAge: Infinity,
  minimumAge: Infinity,
};

const stripDiacritics = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const formats = createFormats();

const translateChunk = (subject: string, locale: string, translateAccentless: boolean): string => {
  if (locale === 'en') {
    return subject;
  }

  return subject.split(' ').map((word) => {
    // Preserve trailing punctuation (e.g. commas)
    const punctuationMatch = word.match(/^(.+?)([,]+)$/);
    const cleanWord = punctuationMatch ? punctuationMatch[1] : word;
    const punctuation = punctuationMatch ? punctuationMatch[2] : '';

    const monthReplacement = replaceMonthName(cleanWord, locale, translateAccentless);

    if (monthReplacement) {
      return monthReplacement + punctuation;
    }

    const dayReplacement = replaceDayName(cleanWord, locale, translateAccentless);

    if (dayReplacement) {
      return dayReplacement + punctuation;
    }

    return word;
  }).join(' ');
};

export default (input: string, userConfiguration: UserConfigurationType = defaultConfiguration): readonly DateMatchType[] => {
  const normalizedInput = normalizeInput(input);

  const configuration: ConfigurationType = {
    ...defaultConfiguration,
    ...userConfiguration,
  };

  const locale = configuration.locale || 'en';
  const translateAccentless = Boolean(configuration.translateAccentless);

  if (!(monthsData as Record<string, unknown>)[locale]) {
    throw new Error('No translation available for the target locale.');
  }

  const hasRelativeDateSupport = Boolean((dictionary as Record<string, unknown>)[locale]);

  if (configuration.timezone && !moment.tz.zone(configuration.timezone)) {
    throw new Error('Unrecognized timezone.');
  }

  if (configuration.maximumAge && configuration.maximumAge < 0) {
    throw new Error('`maximumAge` must be a positive number.');
  }

  if (configuration.minimumAge && configuration.minimumAge < 0) {
    throw new Error('`minimumAge` must be a positive number.');
  }

  let words = normalizedInput.split(' ');

  const matches: DateMatchType[] = [];

  const baseDate = parseDate('12:00', 'HH:mm', new Date());

  for (const format of formats) {
    const movingChunks = createMovingChunks(words, format.wordCount);

    let chunkIndex = 0;

    for (const movingChunk of movingChunks) {
      const wordOffset = ++chunkIndex * format.wordCount;

      const subject = movingChunk.join(' ');

      if (format.dateFnsFormat === 'R') {
        if (!configuration.locale) {
        } else if (!hasRelativeDateSupport) {
        } else {
          const maybeDate = extractRelativeDate(subject, configuration.locale, configuration.timezone ?? '');

          if (maybeDate) {
            words = words.slice(wordOffset);

            matches.push({
              date: maybeDate,
              originalText: stripDiacritics(subject),
            } as DateMatchType & { originalText: string });
          }
        }
      } else if (format.dateFnsFormat === 'EEE' || format.dateFnsFormat === 'EEEE') {
        const translatedSubject = translateChunk(subject, locale, translateAccentless);

        const date = parseDate(
          translatedSubject,
          format.dateFnsFormat,
          baseDate,
          { locale: dateFnsLocale },
        );

        if (isValidDate(date)) {
          words = words.slice(wordOffset);

          matches.push({
            date: formatDate(date, 'yyyy-MM-dd'),
            originalText: stripDiacritics(subject),
          } as DateMatchType & { originalText: string });
        }
      } else {
        const yearIsExplicit = typeof format.yearIsExplicit === 'boolean' ? format.yearIsExplicit : true;

        const translatedSubject = format.localised ? translateChunk(subject, locale, translateAccentless) : subject;

        if (yearIsExplicit) {
          const date = parseDate(
            translatedSubject,
            format.dateFnsFormat,
            baseDate,
            { locale: dateFnsLocale },
          );

          if (!isValidDate(date)) {
            continue;
          }

          const formatDirection = format.direction;
          const configurationDirection = configuration.direction;

          if (formatDirection && configurationDirection && format.dateFnsFormat.includes('yyyy') && formatDirection.replace('Y', '') === configurationDirection.replace('Y', '')) {
          } else if (format.direction && format.direction !== configuration.direction) {
            continue;
          }

          if (format.direction && !configuration.direction) {
            continue;
          }

          words = words.slice(wordOffset);

          matches.push({
            date: formatDate(date, 'yyyy-MM-dd'),
            originalText: stripDiacritics(subject),
          } as DateMatchType & { originalText: string });
        } else {
          const date = parseDate(
            translatedSubject,
            format.dateFnsFormat,
            baseDate,
            { locale: dateFnsLocale },
          );

          if (!isValidDate(date)) {
            continue;
          }

          const currentYear = parseInt(formatDate(baseDate, 'yyyy'), 10);

          const currentMonth = parseInt(formatDate(baseDate, 'M'), 10) + currentYear * 12;
          const parsedMonth = parseInt(formatDate(date, 'M'), 10) + parseInt(formatDate(date, 'yyyy'), 10) * 12;
          const difference = parsedMonth - currentMonth;

          let useYear: number;

          if (difference >= configuration.maximumAge) {
            useYear = currentYear - 1;
          } else if (difference < 0 && Math.abs(difference) >= configuration.minimumAge) {
            useYear = currentYear + 1;
          } else {
            useYear = currentYear;
          }

          const maybeDate = parseDate(
            useYear + '-' + formatDate(date, 'MM-dd'),
            'yyyy-MM-dd',
            baseDate,
            { locale: dateFnsLocale },
          );

          if (!isValidDate(maybeDate)) {
            continue;
          }

          if (format.direction && format.direction !== configuration.direction) {
            continue;
          }

          if (format.direction && !configuration.direction) {
            continue;
          }

          words = words.slice(wordOffset);

          matches.push({
            date: formatDate(maybeDate, 'yyyy-MM-dd'),
            originalText: stripDiacritics(subject),
          } as DateMatchType & { originalText: string });
        }
      }
    }
  }

  return matches;
};
