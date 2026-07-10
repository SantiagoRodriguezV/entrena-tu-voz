import type { LevelCategory } from '../types/exercise';

export const colors = {
  background: '#1F1F1F',
  backgroundCompletion: '#333138',
  backgroundLight: '#FFF7F4',
  surface: '#2A2A2A',
  surfaceLight: '#FFFFFF',
  textPrimary: '#FFFFFF',
  light: '#FFF8F8',
  textDark: '#1F1F1F',
  textSecondary: '#B8B8B8',
  textMuted: '#767676',
  primary: '#DD475B',
  primaryShadow: '#991850',
  secondary: '#22BAA6',
  secondaryDark: '#1A8F80',
  accent: '#30A296',
  border: '#3A3A3A',
  borderLight: '#E2E4EA',
  disabled: '#4A4A4A',
  success: '#22BAA6',
  warning: '#F4AC45',
  error: '#DD475B',
  signalLow: '#767676',
  nodeActive: '#22BAA6',
  nodeLocked: '#4A4A4A',
  micActive: '#22BAA6',
  micInactive: '#767676',
  pitchPerfect: '#22BAA6',
  pitchGood: '#5ED4C4',
  pitchPartial: '#F4AC45',
  pitchWeak: '#DD475B',
  pitchMiss: '#767676',
} as const;

/** Design tokens — use when explicitly referenced; do not replace `colors` globally yet */
export const palette = {
  dark100: '#333036',
  dark90: '#423D43',
  dark80: '#474248',
  dark70: '#4B464C',
  dark60: '#534F54',
  grey1: '#767676',
  grey2: '#B2B2B2',
  light: '#FFF8F8',
  bone: '#FFF5D5',
  boneShade: '#D9C19F',
  red: '#DD475B',
  redLightSoft: '#E7A3AF',
  redLightMain: '#E37A88',
  redShadeSoft1: '#BA3958',
  redShadeSoft2: '#AA3D5B',
  redShadeSoft3: '#AA2453',
  redShadeMain: '#991C52',
  redShadeHeavy1: '#6F0F39',
  redShadeHeavy2: '#520627',
  turq: '#22BAA6',
  turqLightSoft: '#A8FDF2',
  turqLightMain: '#5AE4CD',
  turqShadeSoft1: '#28958E',
  turqShadeSoft2: '#0A7C80',
  turqShadeMain: '#0D6E74',
  turqShadeHeavy1: '#0C545C',
  turqShadeHeavy2: '#06383D',
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
