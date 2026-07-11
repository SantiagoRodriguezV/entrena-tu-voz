import { getCentsError, getPitchScore } from './pitchUtils';
import {
  getPitchVolumeCorrelationFactor,
  getVolumeCategoryForUser,
  getVolumeScore,
} from './volumeUtils';
import { getScoringHz, isSungFrame } from './evaluation/sungFrame';
import { colors } from '../theme/colors';
import { ExerciseNote, VocalFrame } from '../types/exercise';

export const ACCURACY_COLORS = {
  perfect: colors.pitchPerfect,
  partial: colors.pitchPartial,
  weak: colors.pitchWeak,
  miss: colors.pitchMiss,
} as const;

export const PAUSE_ACCURACY_THRESHOLD = 20;

export function getPitchAccuracyPercent(centsError: number): number {
  return Math.round(getPitchScore(centsError) * 100);
}

export function getVolumeAccuracyPercent(
  volumeDb: number | null,
  comfortDb?: number | null,
): number {
  if (volumeDb === null) return 0;
  return Math.round(
    getVolumeScore(getVolumeCategoryForUser(volumeDb, comfortDb)) * 100,
  );
}

export type LiveAccuracyOptions = {
  comfortDb?: number | null;
};

/**
 * Live accuracy for the current note.
 * Returns 0 unless the mic reports real sung pitch this frame —
 * never credits duration alone or stabilizer voice-hold ghosts.
 * Pitch + volume are correlated (good pitch with loud intensity = partial).
 */
export function getLiveAccuracyPercent(
  frame: VocalFrame,
  targetNote: ExerciseNote,
  durationHeldRatio: number,
  options?: LiveAccuracyOptions,
): number {
  if (!isSungFrame(frame)) return 0;

  const hz = getScoringHz(frame);
  if (hz === null) return 0;

  const pitchScore = getPitchScore(getCentsError(hz, targetNote.targetHz));
  const pitchPercent = Math.round(pitchScore * 100);

  const db = frame.relativeDb ?? frame.volumeDb;
  const volumeCategory =
    db !== null
      ? getVolumeCategoryForUser(db, options?.comfortDb)
      : frame.volumeCategory;
  const volumePercent = Math.round(getVolumeScore(volumeCategory) * 100);
  const durationPercent = Math.round(Math.min(1, durationHeldRatio) * 100);

  const correlation = getPitchVolumeCorrelationFactor(pitchScore, volumeCategory);

  const combined =
    (pitchPercent * 0.45 + volumePercent * 0.3 + durationPercent * 0.25) *
    correlation;

  return Math.round(Math.max(0, Math.min(100, combined)));
}

export function getColorFromAccuracy(percent: number): string {
  if (percent >= 75) return ACCURACY_COLORS.perfect;
  if (percent >= 40) return ACCURACY_COLORS.partial;
  if (percent >= 20) return ACCURACY_COLORS.weak;
  return ACCURACY_COLORS.miss;
}

export function shouldPauseTimeline(
  percent: number,
  isVoiceActive: boolean,
): boolean {
  return isVoiceActive && percent < PAUSE_ACCURACY_THRESHOLD;
}

export function aggregateExerciseAccuracy(
  performances: { finalScore: number }[],
): number {
  if (performances.length === 0) return 0;
  const avg =
    performances.reduce((s, p) => s + p.finalScore, 0) / performances.length;
  return Math.round(avg * 100);
}

export function countCorrectNotes(
  performances: { finalScore: number }[],
  threshold = 0.6,
): number {
  return performances.filter((p) => p.finalScore >= threshold).length;
}

export function countNotesAboveAccuracy(
  performances: { finalScore: number }[],
  threshold = 0.75,
): number {
  return performances.filter((p) => p.finalScore >= threshold).length;
}
