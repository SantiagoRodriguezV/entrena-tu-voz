import { PITCH_THRESHOLDS } from '../../types/exercise';
import {
  CoachingMessage,
  EnrichedVocalFrame,
  ExerciseNote,
} from '../../types/exercise';
import { getPitchScore } from '../pitchUtils';
import { isSungFrame } from './sungFrame';

export const COACHING_COPY: Record<CoachingMessage, string> = {
  higher: '¡Más alto!',
  lower: '¡Más grave!',
  keepGoing: '¡Sigue!',
  holdNote: '¡Mantén la nota!',
  tooQuiet: 'Te escucho muy bajo',
  tooLoud: 'Baja un poco la intensidad',
  noVoice: 'No te escucho todavía',
  unstable: 'Busca sostener la nota',
  good: '¡Bien hecho!',
  uncertain: 'No pude leer bien tu voz',
  reachNote: 'Busca la nota para continuar',
  pitchOkTooLoud: 'Llegaste a la nota, pero baja un poco la intensidad',
  pitchOkExtreme: 'La nota estuvo cerca, pero la intensidad fue demasiado alta',
};

export type CoachDecisionContext = {
  frame: EnrichedVocalFrame;
  note: ExerciseNote | null;
  /** True when timeline is frozen waiting for correct pitch at note end. */
  holdingForPitch?: boolean;
  /** Rolling pitch variance proxy 0–1 (higher = more stable). */
  liveStability?: number | null;
};

/**
 * Pedagogical decision engine — didactic messages only.
 * Does not claim physiological correctness or clinical safety.
 * Pitch and volume are correlated: good pitch with loud intensity is partial success.
 */
export function decideCoachingMessage(
  context: CoachDecisionContext,
): CoachingMessage {
  const { frame, holdingForPitch, liveStability } = context;

  if (holdingForPitch) {
    return 'reachNote';
  }

  if (!isSungFrame(frame)) {
    return 'noVoice';
  }

  if (frame.captureConfidence < 0.35) {
    return 'uncertain';
  }

  const cents = frame.pitchErrorCents;
  const pitchScore =
    cents !== null ? getPitchScore(cents) : 0;
  const pitchStrong = pitchScore >= 0.85;

  if (pitchStrong && frame.volumeCategory === 'extreme') {
    return 'pitchOkExtreme';
  }
  if (pitchStrong && frame.volumeCategory === 'high') {
    return 'pitchOkTooLoud';
  }
  if (pitchStrong && frame.volumeCategory === 'moderate') {
    return 'good';
  }

  if (frame.clippingDetected || frame.volumeCategory === 'extreme') {
    return 'tooLoud';
  }

  if (frame.volumeCategory === 'high') {
    return 'tooLoud';
  }

  if (frame.volumeCategory === 'low') {
    return 'tooQuiet';
  }

  if (cents !== null) {
    const abs = Math.abs(cents);
    if (abs > PITCH_THRESHOLDS.partialCents) {
      return cents < 0 ? 'higher' : 'lower';
    }
    if (abs > PITCH_THRESHOLDS.goodCents) {
      return cents < 0 ? 'higher' : 'lower';
    }
  }

  if (
    liveStability !== null &&
    liveStability !== undefined &&
    liveStability < 0.45
  ) {
    return 'unstable';
  }

  if (cents !== null && Math.abs(cents) <= PITCH_THRESHOLDS.perfectCents) {
    return 'good';
  }

  if (cents !== null && Math.abs(cents) <= PITCH_THRESHOLDS.goodCents) {
    return 'holdNote';
  }

  return 'keepGoing';
}

export function getCoachingCopy(message: CoachingMessage): string {
  return COACHING_COPY[message];
}
