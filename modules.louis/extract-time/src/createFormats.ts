import cartesian from 'cartesian';
import calculateSpecificity from './calculateSpecificity';
import type { TimeNotationType } from './types';

type FormatDefinition = {
  dateFnsFormat: string;
  timeNotation: TimeNotationType;
  test?: false;
  normalizeInput?: (input: string) => string;
};

export type Format = FormatDefinition & { specificity: number; wordCount: number };

const militaryTimeFormats = [
  ...(cartesian([
    ['HH', 'H'],
    [':', '.'],
    ['mm', 'm'],
  ]) as string[][])
    .map((combination) => {
      return {
        dateFnsFormat: combination.join(''),
        normalizeInput: (input: string) => {
          return input === '24:00' ? '00:00' : input;
        },
        timeNotation: 24 as const,
      };
    }),
];

const civilianTimeFormats = [
  ...(cartesian([
    ['hh', 'h'],
    [':', '.'],
    ['mm', 'm'],
    ['', ' '],
    ['a'],
  ]) as string[][])
    .map((combination) => {
      return {
        dateFnsFormat: combination.join(''),
        timeNotation: 12 as const,
      };
    }),
];

const unsafeCivilianTimeFormats = [
  ...(cartesian([
    ['hh', 'h'],
    [':', '.'],
    ['mm', 'm'],
  ]) as string[][])
    .map((combination) => {
      return {
        dateFnsFormat: combination.join(''),
        timeNotation: 12 as const,
      };
    }),
];

const civilianTimeFormatsWithoutMinutes = [
  ...(cartesian([
    ['hh', 'h'],
    ['', ' '],
    ['a'],
  ]) as string[][])
    .map((combination) => {
      return {
        dateFnsFormat: combination.join(''),
        timeNotation: 12 as const,
      };
    }),
];

export default (timeNotation: TimeNotationType | null = null): Format[] => {
  let formats: FormatDefinition[];

  if (timeNotation === 12) {
    formats = [
      ...civilianTimeFormats,
      ...unsafeCivilianTimeFormats,
    ];
  } else if (timeNotation === 24) {
    formats = [
      // HH.mm.ss is unsafe because it can be confused with date format (YY.MM.DD).
      {
        dateFnsFormat: 'HH:mm:ss',
        timeNotation: 24 as const,
      },
      ...militaryTimeFormats,
    ];
  } else {
    formats = [
      // HH.mm.ss is unsafe because it can be confused with date format (YY.MM.DD).
      {
        dateFnsFormat: 'HH:mm:ss',
        timeNotation: 24 as const,
      },
      ...militaryTimeFormats,
      ...civilianTimeFormats,
      ...civilianTimeFormatsWithoutMinutes,
    ];
  }

  return formats
    .map((format) => {
      return {
        specificity: calculateSpecificity(format.dateFnsFormat),
        wordCount: format.dateFnsFormat.replace(/[^ ]/g, '').length + 1,
        ...format,
      };
    })
    .sort((a, b) => {
      if (b.specificity === a.specificity) {
        return a.dateFnsFormat.localeCompare(b.dateFnsFormat);
      }

      return b.specificity - a.specificity;
    });
};
