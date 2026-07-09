// Demo note: this is not calibrated dB SPL.
// It represents an approximate relative input level for visual feedback.

import { getColorFromAccuracy } from './accuracyUtils';
import { colors } from '../theme/colors';
import { VolumeCategory } from '../types/exercise';

const VOLUME_THRESHOLDS = {
  lowMax: 55,
  moderateMax: 72,
  highMax: 85,
};

export function getVolumeCategory(volumeDb: number): VolumeCategory {
  if (volumeDb < VOLUME_THRESHOLDS.lowMax) return 'low';
  if (volumeDb < VOLUME_THRESHOLDS.moderateMax) return 'moderate';
  if (volumeDb < VOLUME_THRESHOLDS.highMax) return 'high';
  return 'extreme';
}

export function getVolumeScore(category: VolumeCategory): number {
  switch (category) {
    case 'moderate':
      return 1;
    case 'low':
    case 'high':
      return 0.55;
    case 'extreme':
      return 0.2;
    default:
      return 0;
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
