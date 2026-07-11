import { ExerciseNote } from '../types/exercise';
import {
  getBeginnerTrainingBand,
  HzBand,
  VoiceTypeId,
} from '../data/voiceTypeRanges';

export type UserVocalCalibration = {
  comfortHz: number;
  lowerHz: number;
  higherHz: number;
  comfortZoneHz: [number, number];
  /** Median relative mic level during comfortable note — not dB SPL. */
  comfortDb: number;
  calibratedAt: number;
};

export function buildComfortZone(
  comfortHz: number,
  lowerHz: number,
  higherHz: number,
): [number, number] {
  const values = [comfortHz, lowerHz, higherHz].filter(
    (hz) => hz > 0 && Number.isFinite(hz),
  );
  if (values.length === 0) return [130, 260];
  return [Math.min(...values), Math.max(...values)];
}

export function createVocalCalibration(input: {
  comfortHz: number;
  lowerHz: number;
  higherHz: number;
  comfortDb: number;
}): UserVocalCalibration {
  return {
    comfortHz: input.comfortHz,
    lowerHz: input.lowerHz,
    higherHz: input.higherHz,
    comfortZoneHz: buildComfortZone(
      input.comfortHz,
      input.lowerHz,
      input.higherHz,
    ),
    comfortDb: input.comfortDb,
    calibratedAt: Date.now(),
  };
}

function intersectBands(a: HzBand, b: HzBand): HzBand | null {
  const lo = Math.max(a[0], b[0]);
  const hi = Math.min(a[1], b[1]);
  if (lo >= hi) return null;
  return [lo, hi];
}

/** Effective exercise band: training tessitura ∩ personal comfort (when available). */
export function getEffectiveExerciseBand(
  voiceTypeId: VoiceTypeId | null | undefined,
  calibration: UserVocalCalibration | null | undefined,
): HzBand | null {
  const training = voiceTypeId
    ? getBeginnerTrainingBand(voiceTypeId)
    : null;
  const comfort: HzBand | null = calibration
    ? calibration.comfortZoneHz
    : null;

  if (training && comfort) {
    return intersectBands(training, comfort) ?? comfort;
  }
  return comfort ?? training;
}

export function clampHzToBand(hz: number, band: HzBand): number {
  return Math.max(band[0], Math.min(band[1], hz));
}

/**
 * Clamp exercise note targets into the effective comfort/training band.
 * Timing (startMs / durationMs) is preserved.
 */
export function clampExerciseNotesToComfort(
  notes: ExerciseNote[],
  calibration: UserVocalCalibration | null | undefined,
  voiceTypeId: VoiceTypeId | null | undefined,
): ExerciseNote[] {
  const band = getEffectiveExerciseBand(voiceTypeId, calibration);
  if (!band) return notes;

  return notes.map((note) => ({
    ...note,
    targetHz: clampHzToBand(note.targetHz, band),
  }));
}

export function median(values: number[]): number {
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length === 0) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}
