/**
 * Average pedagogical voice-type ranges (equal temperament, A4 = 440 Hz).
 * Inspired by norms in the Manual Básico de Evaluación de la voz —
 * not a clinical diagnosis or calibrated lab measurement.
 */

export type VoiceTypeId =
  | 'soprano'
  | 'mezzoSoprano'
  | 'contralto'
  | 'tenor'
  | 'baritone'
  | 'bass';

export type HzBand = readonly [number, number];

export type VoiceTypeRange = {
  label: string;
  /** Typical expected singing range (global). */
  expectedRangeHz: HzBand;
  /** Wider extension from the manual. */
  manualExtensionHz: HzBand;
  /** Comfortable tessitura / habitual zone. */
  manualTessituraHz: HzBand;
  /** Tessitura used for beginner training exercises. */
  beginnerTrainingRangeHz: HzBand;
  /**
   * @deprecated Prefer beginnerTrainingRangeHz.
   * Kept as alias of the previous narrower beginner band where it differed.
   */
  beginnerExerciseHz: HzBand;
};

export const VOICE_TYPE_RANGES: Record<VoiceTypeId, VoiceTypeRange> = {
  soprano: {
    label: 'Soprano',
    expectedRangeHz: [261.63, 880.0],
    manualExtensionHz: [196, 1175],
    manualTessituraHz: [392, 698],
    beginnerTrainingRangeHz: [392.0, 698.46],
    beginnerExerciseHz: [392, 523],
  },
  mezzoSoprano: {
    label: 'Mezzosoprano',
    expectedRangeHz: [220.0, 698.46],
    manualExtensionHz: [165, 880],
    manualTessituraHz: [294, 523],
    beginnerTrainingRangeHz: [294, 523],
    beginnerExerciseHz: [294, 440],
  },
  contralto: {
    label: 'Contralto',
    expectedRangeHz: [174.61, 587.33],
    manualExtensionHz: [131, 784],
    manualTessituraHz: [294, 523],
    beginnerTrainingRangeHz: [294, 523],
    beginnerExerciseHz: [262, 392],
  },
  tenor: {
    label: 'Tenor',
    expectedRangeHz: [123.47, 392.0],
    manualExtensionHz: [98, 523],
    manualTessituraHz: [173, 330],
    beginnerTrainingRangeHz: [173, 330],
    beginnerExerciseHz: [173, 262],
  },
  baritone: {
    label: 'Barítono',
    expectedRangeHz: [98.0, 329.63],
    manualExtensionHz: [83, 440],
    manualTessituraHz: [147, 262],
    beginnerTrainingRangeHz: [147, 262],
    beginnerExerciseHz: [147, 220],
  },
  bass: {
    label: 'Bajo',
    expectedRangeHz: [82.41, 261.63],
    manualExtensionHz: [65, 349],
    manualTessituraHz: [110, 196],
    beginnerTrainingRangeHz: [110, 196],
    beginnerExerciseHz: [110, 174],
  },
};

export const VOICE_TYPE_IDS = Object.keys(VOICE_TYPE_RANGES) as VoiceTypeId[];

export function getVoiceType(id: VoiceTypeId): VoiceTypeRange {
  return VOICE_TYPE_RANGES[id];
}

export function isHzInBand(hz: number, band: HzBand): boolean {
  return hz >= band[0] && hz <= band[1];
}

export function getBeginnerTrainingBand(id: VoiceTypeId): HzBand {
  return VOICE_TYPE_RANGES[id].beginnerTrainingRangeHz;
}

/** @deprecated Prefer getBeginnerTrainingBand */
export function getBeginnerExerciseBand(id: VoiceTypeId): HzBand {
  return VOICE_TYPE_RANGES[id].beginnerExerciseHz;
}

/** True when pitch is outside the comfortable tessitura for this voice type. */
export function isOutsideTessitura(hz: number, id: VoiceTypeId): boolean {
  return !isHzInBand(hz, VOICE_TYPE_RANGES[id].manualTessituraHz);
}

function bandOverlap(a: HzBand, b: HzBand): number {
  const lo = Math.max(a[0], b[0]);
  const hi = Math.min(a[1], b[1]);
  return Math.max(0, hi - lo);
}

function bandCenter(band: HzBand): number {
  return (band[0] + band[1]) / 2;
}

/**
 * Approximate voice-type match from an observed min–max extent.
 * Prefers tessitura overlap; ties broken by closeness of centers.
 * Pedagogical estimate only — not a clinical classification.
 */
export function estimateVoiceTypeFromExtent(
  minHz: number,
  maxHz: number,
): VoiceTypeId {
  const observed: HzBand = [
    Math.min(minHz, maxHz),
    Math.max(minHz, maxHz),
  ];
  const observedCenter = bandCenter(observed);

  let bestId: VoiceTypeId = 'baritone';
  let bestOverlap = -1;
  let bestCenterDist = Number.POSITIVE_INFINITY;

  for (const id of VOICE_TYPE_IDS) {
    const range = VOICE_TYPE_RANGES[id];
    const overlap = bandOverlap(observed, range.manualTessituraHz);
    const centerDist = Math.abs(observedCenter - bandCenter(range.manualTessituraHz));

    if (
      overlap > bestOverlap ||
      (overlap === bestOverlap && centerDist < bestCenterDist)
    ) {
      bestId = id;
      bestOverlap = overlap;
      bestCenterDist = centerDist;
    }
  }

  if (bestOverlap <= 0) {
    bestCenterDist = Number.POSITIVE_INFINITY;
    for (const id of VOICE_TYPE_IDS) {
      const range = VOICE_TYPE_RANGES[id];
      const overlap = bandOverlap(observed, range.expectedRangeHz);
      const centerDist = Math.abs(
        observedCenter - bandCenter(range.expectedRangeHz),
      );
      if (
        overlap > bestOverlap ||
        (overlap === bestOverlap && centerDist < bestCenterDist)
      ) {
        bestId = id;
        bestOverlap = overlap;
        bestCenterDist = centerDist;
      }
    }
  }

  return bestId;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const t = idx - lo;
  return sorted[lo] * (1 - t) + sorted[hi] * t;
}

/**
 * Estimate voice type from sung pitch samples (uses p10–p90 as observed extent).
 */
export function estimateVoiceTypeFromSamples(samplesHz: number[]): VoiceTypeId | null {
  const valid = samplesHz.filter((hz) => hz > 0 && Number.isFinite(hz));
  if (valid.length < 3) return null;

  const sorted = [...valid].sort((a, b) => a - b);
  const minHz = percentile(sorted, 0.1);
  const maxHz = percentile(sorted, 0.9);
  return estimateVoiceTypeFromExtent(minHz, maxHz);
}
