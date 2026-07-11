import type { LevelCategory } from '../types/exercise';

/** Neutral scale (LIGHT 50 → DARK 950) */
export const neutral = {
  50: '#FFF8F8',
  100: '#F0E9EA',
  200: '#D5CFD0',
  300: '#B5AFB2',
  400: '#928D91',
  500: '#747074',
  600: '#5D595E',
  700: '#4A464C',
  800: '#3F3C41',
  900: '#37343A',
  950: '#333036',
} as const;

/** Red scale (brand RED = 500) */
export const red = {
  50: '#E7A3AF',
  100: '#E692A0',
  200: '#E58190',
  300: '#E36F7F',
  400: '#E05C6E',
  500: '#DD475B',
  600: '#BB3158',
  700: '#991C52',
  800: '#831748',
  900: '#6E123E',
  950: '#5A0D33',
} as const;

/** Turq scale (brand TURQ = 500) */
export const turq = {
  50: '#A8FDF2',
  100: '#9CF5EA',
  200: '#83E6D9',
  300: '#68D8C8',
  400: '#4BC9B7',
  500: '#22BAA6',
  600: '#109D94',
  700: '#07807F',
  800: '#076569',
  900: '#094A52',
  950: '#093E46',
} as const;

export const yellow = '#F4AC45';

/** Semantic tokens derived from the scales above. */
export const colors = {
  background: neutral[950],
  backgroundCompletion: neutral[900],
  backgroundLight: neutral[50],
  surface: neutral[800],
  surfaceLight: neutral[50],
  textPrimary: neutral[50],
  light: neutral[50],
  textDark: neutral[950],
  textSecondary: neutral[300],
  textMuted: neutral[500],
  primary: red[500],
  primaryShadow: red[700],
  secondary: turq[500],
  secondaryDark: turq[600],
  accent: turq[600],
  border: neutral[800],
  borderLight: neutral[200],
  disabled: neutral[700],
  success: turq[500],
  warning: yellow,
  error: red[500],
  signalLow: neutral[500],
  nodeActive: turq[500],
  nodeLocked: neutral[700],
  micActive: turq[500],
  micInactive: neutral[500],
  pitchPerfect: turq[500],
  pitchGood: turq[300],
  pitchPartial: yellow,
  pitchWeak: red[500],
  pitchMiss: neutral[500],
} as const;

/**
 * Legacy palette aliases remapped onto the new scales.
 * Prefer `neutral` / `red` / `turq` / `yellow` for new code.
 */
export const palette = {
  dark100: neutral[950],
  dark90: neutral[900],
  dark80: neutral[800],
  dark70: neutral[700],
  dark60: neutral[600],
  grey1: neutral[500],
  grey2: neutral[300],
  light: neutral[50],
  /** @deprecated Outside scale — maps to yellow for soft warm UI leftovers. */
  bone: yellow,
  /** @deprecated Outside scale — maps to neutral[200]. */
  boneShade: neutral[200],
  red: red[500],
  redLightSoft: red[50],
  redLightMain: red[300],
  redShadeSoft1: red[600],
  redShadeSoft2: red[600],
  redShadeSoft3: red[700],
  redShadeMain: red[700],
  redShadeHeavy1: red[900],
  redShadeHeavy2: red[950],
  turq: turq[500],
  turqLightSoft: turq[50],
  turqLightMain: turq[300],
  turqShadeSoft1: turq[600],
  turqShadeSoft2: turq[700],
  turqShadeMain: turq[800],
  turqShadeHeavy1: turq[900],
  turqShadeHeavy2: turq[950],
} as const;

export function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export type LevelAccent = {
  border: string;
  accent: string;
  accentHeavy: string;
};

export function getLevelAccent(category: LevelCategory): LevelAccent {
  return category === 'distorsiones'
    ? {
        border: palette.redShadeMain,
        accent: palette.red,
        accentHeavy: palette.redShadeHeavy1,
      }
    : {
        border: palette.turqShadeMain,
        accent: palette.turq,
        accentHeavy: palette.turqShadeHeavy1,
      };
}
