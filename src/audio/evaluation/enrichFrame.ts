import { getCentsError } from '../pitchUtils';
import { getVolumeCategoryForUser } from '../volumeUtils';
import { getScoringHz } from './sungFrame';
import {
  EnrichedVocalFrame,
  ExerciseNote,
  VocalFrame,
} from '../../types/exercise';

export type EnrichFrameOptions = {
  comfortDb?: number | null;
};

/** Attach target-dependent fields for coaching and live UI. */
export function enrichFrameForNote(
  frame: VocalFrame,
  note: ExerciseNote | null,
  options?: EnrichFrameOptions,
): EnrichedVocalFrame {
  const scoringHz = getScoringHz(frame);
  const targetHz = note?.targetHz ?? null;
  const pitchErrorCents =
    scoringHz !== null && targetHz !== null
      ? getCentsError(scoringHz, targetHz)
      : null;

  const db = frame.relativeDb ?? frame.volumeDb;
  const volumeCategory =
    db !== null
      ? getVolumeCategoryForUser(db, options?.comfortDb)
      : frame.volumeCategory;

  return {
    ...frame,
    volumeCategory,
    targetHz,
    pitchErrorCents,
  };
}
