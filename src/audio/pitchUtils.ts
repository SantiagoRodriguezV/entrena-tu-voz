import {
  ASSISTIVE_MARGIN_CENTS,
  ExerciseNote,
  HORIZONTAL_SNAP_STRENGTH,
  PITCH_THRESHOLDS,
  SNAP_STRENGTH,
} from '../types/exercise';
import { colors } from '../theme/colors';

export {
  ASSISTIVE_MARGIN_CENTS,
  HORIZONTAL_SNAP_STRENGTH,
  SNAP_STRENGTH,
  PITCH_THRESHOLDS,
};

export function hzToY(
  hz: number,
  minHz: number,
  maxHz: number,
  height: number,
): number {
  const clamped = Math.max(minHz, Math.min(maxHz, hz));
  const ratio = (clamped - minHz) / (maxHz - minHz);
  return height - ratio * height;
}

export function getCentsError(detectedHz: number, targetHz: number): number {
  if (detectedHz <= 0 || targetHz <= 0) return 999;
  return 1200 * Math.log2(detectedHz / targetHz);
}

export function getPitchScore(centsError: number): number {
  const abs = Math.abs(centsError);
  if (abs <= PITCH_THRESHOLDS.perfectCents) return 1;
  if (abs <= PITCH_THRESHOLDS.goodCents) return 0.85;
  if (abs <= PITCH_THRESHOLDS.partialCents) return 0.6;
  if (abs <= PITCH_THRESHOLDS.weakCents) return 0.25;
  return 0;
}

export function getCurrentTargetNote(
  timeMs: number,
  notes: ExerciseNote[],
): ExerciseNote | null {
  for (let i = notes.length - 1; i >= 0; i -= 1) {
    if (timeMs >= notes[i].startMs) {
      return notes[i];
    }
  }
  return notes[0] ?? null;
}

export function isWithinNote(timeMs: number, note: ExerciseNote): boolean {
  return timeMs >= note.startMs && timeMs <= note.startMs + note.durationMs;
}

/**
 * Optional visual assist when the singer is already near the target.
 * Never use for scoring — exercise evaluation must use raw detected Hz.
 */
export function applyPitchSnap(
  detectedHz: number,
  targetHz: number,
): number {
  if (SNAP_STRENGTH <= 0) return detectedHz;

  const centsError = getCentsError(detectedHz, targetHz);
  if (Math.abs(centsError) <= ASSISTIVE_MARGIN_CENTS) {
    const snappedCents = centsError * (1 - SNAP_STRENGTH);
    return targetHz * Math.pow(2, snappedCents / 1200);
  }
  return detectedHz;
}

/** Hz used for the pitch ball — faithful voice with optional micro-assist. */
export function getDisplayPitchHz(
  detectedHz: number,
  targetHz: number,
): number {
  return applyPitchSnap(detectedHz, targetHz);
}

export function applyHorizontalSnap(
  timeMs: number,
  note: ExerciseNote,
): number {
  if (HORIZONTAL_SNAP_STRENGTH <= 0) return timeMs;

  const noteStart = note.startMs;
  const noteEnd = note.startMs + note.durationMs;
  if (timeMs >= noteStart && timeMs <= noteEnd) {
    const progress = (timeMs - noteStart) / note.durationMs;
    const snappedProgress =
      progress * (1 - HORIZONTAL_SNAP_STRENGTH) + 0.5 * HORIZONTAL_SNAP_STRENGTH;
    return noteStart + snappedProgress * note.durationMs;
  }
  return timeMs;
}

export function isPitchOnTarget(
  detectedHz: number,
  targetHz: number,
  maxCents: number = PITCH_THRESHOLDS.goodCents,
): boolean {
  return Math.abs(getCentsError(detectedHz, targetHz)) <= maxCents;
}

export function getPitchColor(centsError: number): string {
  const abs = Math.abs(centsError);
  if (abs <= PITCH_THRESHOLDS.perfectCents) return colors.pitchPerfect;
  if (abs <= PITCH_THRESHOLDS.goodCents) return colors.pitchGood;
  if (abs <= PITCH_THRESHOLDS.partialCents) return colors.pitchPartial;
  if (abs <= PITCH_THRESHOLDS.weakCents) return colors.pitchWeak;
  return colors.pitchMiss;
}

export function getMinMaxHz(notes: ExerciseNote[]): { minHz: number; maxHz: number } {
  const hzValues = notes.map((n) => n.targetHz);
  const min = Math.min(...hzValues);
  const max = Math.max(...hzValues);
  const padding = (max - min) * 0.35 || 20;
  return { minHz: min - padding, maxHz: max + padding };
}

export function getPitchRangeForDisplay(
  notes: ExerciseNote[],
  detectedHz: number | null,
): { minHz: number; maxHz: number } {
  const base = getMinMaxHz(notes);
  if (detectedHz === null || detectedHz <= 0) return base;
  const padding = (base.maxHz - base.minHz) * 0.08 || 12;
  return {
    minHz: Math.min(base.minHz, detectedHz - padding),
    maxHz: Math.max(base.maxHz, detectedHz + padding),
  };
}
