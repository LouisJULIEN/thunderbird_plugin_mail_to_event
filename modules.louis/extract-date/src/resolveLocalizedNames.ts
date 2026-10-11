import monthsData from '@/months.json';
import daysData from '@/days.json';

type LocaleData = Record<string, string[]>;
type LocalesData = Record<string, LocaleData>;

const stripDiacritics = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const enMonths = (monthsData as LocalesData).en;
const enDays = (daysData as LocalesData).en;

// Cache: locale -> Map<lowercaseName, englishName>
const monthLookupCache: Record<string, Record<string, string>> = {};
const dayLookupCache: Record<string, Record<string, string>> = {};

const buildMonthLookup = (locale: string): Record<string, string> => {
  if (monthLookupCache[locale]) {
    return monthLookupCache[locale];
  }

  const localeData = (monthsData as LocalesData)[locale];

  if (!localeData) {
    monthLookupCache[locale] = {};
    return monthLookupCache[locale];
  }

  const lookup: Record<string, string> = {};

  for (const monthNum of Object.keys(localeData)) {
    const names = localeData[monthNum];
    const enNames = enMonths[monthNum];

    for (let i = 0; i < names.length; i++) {
      const enName = enNames[i < enNames.length ? i : 0];
      lookup[names[i].toLowerCase()] = enName.charAt(0).toUpperCase() + enName.slice(1);
    }
  }

  monthLookupCache[locale] = lookup;
  return lookup;
};

const buildDayLookup = (locale: string): Record<string, string> => {
  if (dayLookupCache[locale]) {
    return dayLookupCache[locale];
  }

  const localeData = (daysData as LocalesData)[locale];

  if (!localeData) {
    dayLookupCache[locale] = {};
    return dayLookupCache[locale];
  }

  const lookup: Record<string, string> = {};

  for (const dayNum of Object.keys(localeData)) {
    const names = localeData[dayNum];
    const enNames = enDays[dayNum];

    for (let i = 0; i < names.length; i++) {
      const enName = enNames[i < enNames.length ? i : 0];
      lookup[names[i].toLowerCase()] = enName.charAt(0).toUpperCase() + enName.slice(1);
    }
  }

  dayLookupCache[locale] = lookup;
  return lookup;
};

export const replaceMonthName = (word: string, locale: string, accentless: boolean): string | null => {
  const lookup = buildMonthLookup(locale);
  const lower = word.toLowerCase();

  if (lookup[lower]) {
    return lookup[lower];
  }

  if (accentless) {
    const strippedWord = stripDiacritics(lower);

    for (const key of Object.keys(lookup)) {
      if (stripDiacritics(key) === strippedWord) {
        return lookup[key];
      }
    }
  }

  return null;
};

export const replaceDayName = (word: string, locale: string, accentless: boolean): string | null => {
  const lookup = buildDayLookup(locale);
  const lower = word.toLowerCase();

  if (lookup[lower]) {
    return lookup[lower];
  }

  if (accentless) {
    const strippedWord = stripDiacritics(lower);

    for (const key of Object.keys(lookup)) {
      if (stripDiacritics(key) === strippedWord) {
        return lookup[key];
      }
    }
  }

  return null;
};
