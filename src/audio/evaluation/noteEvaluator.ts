import { getCentsError, getPitchScore, isWithinNote } from '../pitchUtils';
import {
  getPitchVolumeCorrelationFactor,
  getVolumeCategoryForUser,
  getVolumeScore,
} from '../volumeUtils';
import { evaluateCaptureQuality } from './captureQuality';
import { getScoringHz, isSungFrame } from './sungFrame';
import {
  ExerciseNote,
  NoteEvaluation,
  NotePerformance,
  VocalFrame,
} from '../../types/exercise';

const FRAME_MS = 50;
const GAP_PENALTY_MS = 150;
const PITCH_CORRECT_THRESHOLD = 0.6;
const VOLUME_CORRECT_THRESHOLD = 0.55;

const WEIGHTS = {
  pitch: 0.35,
  volume: 0.2,
  duration: 0.2,
  continuity: 0.1,
  stability: 0.1,
  capture: 0.05,
} as const;

export type ScoreNoteOptions = {
  heldPastEndMs?: number;
  comfortDb?: number | null;
};

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function continuityFromFrames(noteFrames: VocalFrame[]): number {
  if (noteFrames.length === 0) return 0;

  let activeCount = 0;
  let gapMs = 0;
  let inGap = false;
  let longGapCount = 0;

  for (const frame of noteFrames) {
    if (isSungFrame(frame)) {
      activeCount += 1;
      if (inGap && gapMs >= GAP_PENALTY_MS) {
        longGapCount += 1;
      }
      inGap = false;
      gapMs = 0;
    } else {
      inGap = true;
      gapMs += FRAME_MS;
    }
  }

  if (inGap && gapMs >= GAP_PENALTY_MS) {
    longGapCount += 1;
  }

  const activeRatio = activeCount / noteFrames.length;
  const gapPenalty = Math.min(0.5, longGapCount * 0.15);
  return Math.max(0, Math.min(1, activeRatio * (1 - gapPenalty)));
}

function stabilityFromFrames(
  noteFrames: VocalFrame[],
  targetHz: number,
): number {
  const cents: number[] = [];
  const volumes: number[] = [];

  for (const frame of noteFrames) {
    if (!isSungFrame(frame)) continue;
    const hz = getScoringHz(frame);
    if (hz !== null) {
      cents.push(Math.abs(getCentsError(hz, targetHz)));
    }
    if (frame.relativeDb !== null || frame.volumeDb !== null) {
      volumes.push(frame.relativeDb ?? frame.volumeDb ?? 0);
    }
  }

  if (cents.length === 0) return 0;

  const centsStd = stdDev(cents);
  const volumeStd = volumes.length > 1 ? stdDev(volumes) : 0;

  // Lower variance → higher score. ~40 cents / ~8 dB relative as soft ceilings.
  const pitchStability = Math.max(0, 1 - centsStd / 40);
  const volumeStability = Math.max(0, 1 - volumeStd / 8);
  return pitchStability * 0.7 + volumeStability * 0.3;
}

export function evaluateNote(
  frames: VocalFrame[],
  note: ExerciseNote,
  options?: ScoreNoteOptions,
): NoteEvaluation {
  const noteFrames = frames.filter((frame) => isWithinNote(frame.timeMs, note));

  let activeVoiceMs = 0;
  let correctMs = 0;
  let pitchSum = 0;
  let pitchCount = 0;
  let volumeSum = 0;
  let volumeCount = 0;
  let captureSum = 0;
  let captureCount = 0;
  const volumeCategoryCounts: Record<
    'low' | 'moderate' | 'high' | 'extreme',
    number
  > = {
    low: 0,
    moderate: 0,
    high: 0,
    extreme: 0,
  };

  for (const frame of noteFrames) {
    if (!isSungFrame(frame)) continue;

    activeVoiceMs += FRAME_MS;

    const hz = getScoringHz(frame);
    if (hz === null) continue;

    const pitchScore = getPitchScore(getCentsError(hz, note.targetHz));
    pitchSum += pitchScore;
    pitchCount += 1;

    const db = frame.relativeDb ?? frame.volumeDb;
    const volumeCategory =
      db !== null
        ? getVolumeCategoryForUser(db, options?.comfortDb)
        : frame.volumeCategory;
    volumeCategoryCounts[volumeCategory] += 1;
    const volumeScore = db !== null ? getVolumeScore(volumeCategory) : 0;
    volumeSum += volumeScore;
    volumeCount += 1;

    const capture = evaluateCaptureQuality({
      pitchConfidence: frame.pitchConfidence,
      isVoiceActive: true,
      relativeDb: db,
      volumeCategory,
    });
    captureSum += capture.captureScore;
    captureCount += 1;

    if (
      pitchScore >= PITCH_CORRECT_THRESHOLD &&
      volumeScore >= VOLUME_CORRECT_THRESHOLD
    ) {
      correctMs += FRAME_MS;
    }
  }

  const pitchScore = pitchCount > 0 ? pitchSum / pitchCount : 0;
  const volumeScore = volumeCount > 0 ? volumeSum / volumeCount : 0;
  let durationScore = Math.min(1, activeVoiceMs / note.durationMs);

  if (options?.heldPastEndMs && options.heldPastEndMs > 0) {
    const penalty = Math.min(0.5, (options.heldPastEndMs / note.durationMs) * 0.5);
    durationScore *= 1 - penalty;
  }

  const continuityScore = continuityFromFrames(noteFrames);
  const stabilityScore = stabilityFromFrames(noteFrames, note.targetHz);
  const captureScore = captureCount > 0 ? captureSum / captureCount : 0;

  const dominantVolumeCategory = (
    Object.entries(volumeCategoryCounts) as [
      'low' | 'moderate' | 'high' | 'extreme',
      number,
    ][]
  ).reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ['moderate', 0] as ['low' | 'moderate' | 'high' | 'extreme', number],
  )[0];

  const correlation = getPitchVolumeCorrelationFactor(
    pitchScore,
    dominantVolumeCategory,
  );

  const finalScore =
    (pitchScore * WEIGHTS.pitch +
      volumeScore * WEIGHTS.volume +
      durationScore * WEIGHTS.duration +
      continuityScore * WEIGHTS.continuity +
      stabilityScore * WEIGHTS.stability +
      captureScore * WEIGHTS.capture) *
    correlation;

  return {
    noteId: note.id,
    activeVoiceMs,
    correctMs,
    pitchScore,
    volumeScore,
    durationScore,
    continuityScore,
    stabilityScore,
    captureScore,
    finalScore,
  };
}

/** @deprecated Prefer evaluateNote — kept for call-site compatibility. */
export function scoreNotePerformance(
  frames: VocalFrame[],
  note: ExerciseNote,
  options?: ScoreNoteOptions,
): NotePerformance {
  return evaluateNote(frames, note, options);
}
