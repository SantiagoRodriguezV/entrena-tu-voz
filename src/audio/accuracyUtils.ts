import { getCentsError, getPitchScore } from './pitchUtils';
import { getVolumeCategory, getVolumeScore } from './volumeUtils';
import { ExerciseNote, VocalFrame } from '../types/exercise';

export const ACCURACY_COLORS = {
  perfect: '#22BAA6',
  partial: '#F4AC45',
  weak: '#DD475B',
  miss: '#767676',
} as const;

export const PAUSE_ACCURACY_THRESHOLD = 20;

export function getPitchAccuracyPercent(centsError: number): number {
  return Math.round(getPitchScore(centsError) * 100);
}

export function getVolumeAccuracyPercent(volumeDb: number | null): number {
  if (volumeDb === null) return 0;
  return Math.round(getVolumeScore(getVolumeCategory(volumeDb)) * 100);
}

export function getLiveAccuracyPercent(
  frame: VocalFrame,
  targetNote: ExerciseNote,
  durationHeldRatio: number,
): number {
  const pitchPercent =
    frame.detectedHz !== null && frame.isVoiceActive
      ? getPitchAccuracyPercent(getCentsError(frame.detectedHz, targetNote.targetHz))
      : 0;

  const volumePercent = frame.isVoiceActive
    ? getVolumeAccuracyPercent(frame.volumeDb)
    : 0;

  const durationPercent = Math.round(Math.min(1, durationHeldRatio) * 100);

  const combined =
    pitchPercent * 0.45 + volumePercent * 0.25 + durationPercent * 0.3;

  return Math.round(Math.max(0, Math.min(100, combined)));
}

export function getColorFromAccuracy(percent: number): string {
  if (percent >= 75) return ACCURACY_COLORS.perfect;
  if (percent >= 40) return ACCURACY_COLORS.partial;
  if (percent >= 20) return ACCURACY_COLORS.weak;
  return ACCURACY_COLORS.miss;
}

export function shouldPauseTimeline(percent: number, isVoiceActive: boolean): boolean {
  return isVoiceActive && percent < PAUSE_ACCURACY_THRESHOLD;
}

export function aggregateExerciseAccuracy(performances: { finalScore: number }[]): number {
  if (performances.length === 0) return 0;
  const avg = performances.reduce((s, p) => s + p.finalScore, 0) / performances.length;
  return Math.round(avg * 100);
}

export function countCorrectNotes(
  performances: { finalScore: number }[],
  threshold = 0.6,
): number {
  return performances.filter((p) => p.finalScore >= threshold).length;
}
