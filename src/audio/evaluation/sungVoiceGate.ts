import { VocalFrame } from '../../types/exercise';
import { isSungFrame, SUNG_PITCH_MIN_CONFIDENCE } from './sungFrame';

export const SUNG_VOICE_HOLD_MS = 500;
export const SUNG_VOICE_MIN_CONFIDENCE = SUNG_PITCH_MIN_CONFIDENCE;

/**
 * Detects intentional sung voice (not a single noisy frame).
 * Call each tick; returns true once hold threshold is met.
 */
export function createSungVoiceGate(holdMs = SUNG_VOICE_HOLD_MS) {
  let activeMs = 0;

  return {
    reset() {
      activeMs = 0;
    },
    /** @returns true when sustained sung voice is detected */
    update(frame: VocalFrame | null, tickMs: number): boolean {
      if (!frame) {
        activeMs = 0;
        return false;
      }

      if (isSungFrame(frame)) {
        activeMs += tickMs;
      } else {
        activeMs = 0;
      }

      return activeMs >= holdMs;
    },
    get heldMs() {
      return activeMs;
    },
  };
}
