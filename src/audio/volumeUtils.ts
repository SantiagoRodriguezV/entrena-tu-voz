// Relative mic level — NOT calibrated dB SPL.
// Absolute bands are pedagogical fallbacks when the user has no personal calibration.
// Prefer getVolumeCategoryForUser with comfortDb from mini-calibration.

import { getColorFromAccuracy } from './accuracyUtils';
import { colors } from '../theme/colors';
import { VolumeCategory } from '../types/exercise';

/**
 * Absolute-scale fallback (relative display units from tuner rmsDb).
 */
export const VOLUME_THRESHOLDS = {
  lowMax: 62,
  moderateMax: 78,
  highMax: 86,
} as const;

/**
 * Offsets relative to the user's comfortable singing level (comfortDb).
 */
export const RELATIVE_VOLUME_THRESHOLDS = {
  low: {
    maxDbBelowComfort: -18,
  },
  moderate: {
    minDbFromComfort: -12,
    maxDbFromComfort: 6,
  },
  high: {
    minDbAboveComfort: 6,
    maxDbAboveComfort: 12,
  },
  extreme: {
    minDbAboveComfort: 12,
  },
} as const;

export function getVolumeCategory(volumeDb: number): VolumeCategory {
  if (volumeDb < VOLUME_THRESHOLDS.lowMax) return 'low';
  if (volumeDb < VOLUME_THRESHOLDS.moderateMax) return 'moderate';
  if (volumeDb < VOLUME_THRESHOLDS.highMax) return 'high';
  return 'extreme';
}

/** Categorize volume relative to personal comfort level. */
export function getVolumeCategoryRelative(
  volumeDb: number,
  comfortDb: number,
): VolumeCategory {
  const delta = volumeDb - comfortDb;
  const t = RELATIVE_VOLUME_THRESHOLDS;

  if (delta <= t.low.maxDbBelowComfort) return 'low';
  if (delta < t.moderate.minDbFromComfort) return 'low';
  if (delta <= t.moderate.maxDbFromComfort) return 'moderate';
  if (delta <= t.high.maxDbAboveComfort) return 'high';
  return 'extreme';
}

/**
 * Prefer relative categories when comfortDb is known; else absolute fallback.
 */
export function getVolumeCategoryForUser(
  volumeDb: number,
  comfortDb?: number | null,
): VolumeCategory {
  if (comfortDb !== null && comfortDb !== undefined && Number.isFinite(comfortDb)) {
    return getVolumeCategoryRelative(volumeDb, comfortDb);
  }
  return getVolumeCategory(volumeDb);
}

export function getVolumeScore(category: VolumeCategory): number {
  switch (category) {
    case 'moderate':
      return 1;
    case 'low':
      return 0.45;
    case 'high':
      return 0.5;
    case 'extreme':
      return 0.15;
    default:
      return 0;
  }
}

/** Partial-credit factor when pitch is good but intensity is not moderate. */
export function getPitchVolumeCorrelationFactor(
  pitchScore: number,
  volumeCategory: VolumeCategory,
): number {
  if (pitchScore < 0.85) return 1;
  switch (volumeCategory) {
    case 'moderate':
      return 1;
    case 'high':
      return 0.75;
    case 'extreme':
      return 0.45;
    case 'low':
      return 0.7;
    default:
      return 1;
  }
}

export function getIndicatorColor(
  volumeCategory: VolumeCategory,
  accuracyPercent?: number,
): string {
  if (volumeCategory === 'extreme') return colors.error;
  if (volumeCategory === 'low') return colors.signalLow;

  if (accuracyPercent !== undefined) {
    return getColorFromAccuracy(accuracyPercent);
  }

  return colors.secondary;
}
