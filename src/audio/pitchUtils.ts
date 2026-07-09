import {
  ASSISTIVE_MARGIN_CENTS,
  ExerciseNote,
  PITCH_THRESHOLDS,
  SNAP_STRENGTH,
} from '../types/exercise';

export { ASSISTIVE_MARGIN_CENTS, SNAP_STRENGTH, PITCH_THRESHOLDS };

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
  if (abs <= PITCH_THRESHOLDS.weakCents) return 0.35;
  return 0.1;
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

export function applyPitchSnap(
  detectedHz: number,
  targetHz: number,
): number {
  const centsError = getCentsError(detectedHz, targetHz);
  if (Math.abs(centsError) <= ASSISTIVE_MARGIN_CENTS) {
    const snappedCents = centsError * (1 - SNAP_STRENGTH);
    return targetHz * Math.pow(2, snappedCents / 1200);
  }
  return detectedHz;
}

export function applyHorizontalSnap(
  timeMs: number,
  note: ExerciseNote,
): number {
  const noteStart = note.startMs;
  const noteEnd = note.startMs + note.durationMs;
  if (timeMs >= noteStart && timeMs <= noteEnd) {
    const progress = (timeMs - noteStart) / note.durationMs;
    const snappedProgress = progress * (1 - SNAP_STRENGTH) + 0.5 * SNAP_STRENGTH;
    return noteStart + snappedProgress * note.durationMs;
  }
  return timeMs;
}

export function getPitchColor(centsError: number): string {
  const abs = Math.abs(centsError);
  if (abs <= PITCH_THRESHOLDS.perfectCents) return '#22BAA6';
  if (abs <= PITCH_THRESHOLDS.goodCents) return '#5ED4C4';
  if (abs <= PITCH_THRESHOLDS.partialCents) return '#F4AC45';
  if (abs <= PITCH_THRESHOLDS.weakCents) return '#DD475B';
  return '#767676';
}

export function getMinMaxHz(notes: ExerciseNote[]): { minHz: number; maxHz: number } {
  const hzValues = notes.map((n) => n.targetHz);
  const min = Math.min(...hzValues);
  const max = Math.max(...hzValues);
  const padding = (max - min) * 0.35 || 20;
  return { minHz: min - padding, maxHz: max + padding };
}
