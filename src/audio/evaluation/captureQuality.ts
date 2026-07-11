import { VolumeCategory } from '../../types/exercise';

export type CaptureQualityInput = {
  pitchConfidence: number;
  isVoiceActive: boolean;
  relativeDb: number | null;
  volumeCategory: VolumeCategory;
};

export type CaptureQualityResult = {
  clippingDetected: boolean;
  captureConfidence: number;
  captureScore: number;
};

/**
 * Pragmatic capture quality from tuner confidence + relative level.
 * Does not claim calibrated SPL or clinical signal quality.
 */
export function evaluateCaptureQuality(
  input: CaptureQualityInput,
): CaptureQualityResult {
  const clippingDetected =
    input.volumeCategory === 'extreme' ||
    (input.relativeDb !== null && input.relativeDb >= 90);

  let captureConfidence = input.pitchConfidence;
  if (!input.isVoiceActive) {
    captureConfidence *= 0.35;
  }
  if (clippingDetected) {
    captureConfidence *= 0.45;
  } else if (input.volumeCategory === 'low') {
    captureConfidence *= 0.7;
  }

  captureConfidence = Math.max(0, Math.min(1, captureConfidence));

  let captureScore = captureConfidence;
  if (clippingDetected) {
    captureScore = Math.min(captureScore, 0.35);
  }
  if (!input.isVoiceActive) {
    captureScore = Math.min(captureScore, 0.25);
  }

  return {
    clippingDetected,
    captureConfidence,
    captureScore,
  };
}
