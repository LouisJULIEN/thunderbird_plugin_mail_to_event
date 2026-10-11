export type DateMatchType = {
  readonly date: string;
};

export type DirectionType = 'DM' | 'DMY' | 'DYM' | 'MD' | 'YDM' | 'YMD' | 'MDY';

export type UserConfigurationType = {
  readonly translateAccentless?: boolean;
  readonly direction?: DirectionType;
  readonly locale?: string;
  readonly maximumAge?: number;
  readonly minimumAge?: number;
  readonly timezone?: string;
};

export type ConfigurationType = {
  readonly translateAccentless?: boolean;
  readonly direction?: DirectionType;
  readonly locale?: string;
  readonly maximumAge: number;
  readonly minimumAge: number;
  readonly timezone?: string;
};