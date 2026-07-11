import { VocalFrame } from '../../types/exercise';

/** Minimum tuner confidence to treat a frame as real sung pitch (not noise). */
export const SUNG_PITCH_MIN_CONFIDENCE = 0.55;

/**
 * True only when the mic reports a real pitch this frame.
 * Does NOT count stabilizer voice-hold ghosts.
 */
export function isSungFrame(frame: VocalFrame): boolean {
  return (
    frame.rawHz !== null &&
    frame.rawHz > 0 &&
    frame.pitchConfidence >= SUNG_PITCH_MIN_CONFIDENCE &&
    !frame.clippingDetected
  );
}

/** Hz used for evaluation — raw only, never stabilized display pitch. */
export function getScoringHz(frame: VocalFrame): number | null {
  if (!isSungFrame(frame)) return null;
  return frame.rawHz;
}
