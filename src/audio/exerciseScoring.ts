import { getCentsError, getPitchScore, isWithinNote } from './pitchUtils';
import { getVolumeCategory, getVolumeScore } from './volumeUtils';
import { ExerciseNote, NotePerformance, VocalFrame } from '../types/exercise';

const PITCH_CORRECT_THRESHOLD = 0.6;
const VOLUME_CORRECT_THRESHOLD = 0.55;
const FRAME_MS = 50;

export type ScoreNoteOptions = {
  heldPastEndMs?: number;
};

export function scoreNotePerformance(
  frames: VocalFrame[],
  note: ExerciseNote,
  options?: ScoreNoteOptions,
): NotePerformance {
  const noteFrames = frames.filter((frame) => isWithinNote(frame.timeMs, note));

  let activeVoiceMs = 0;
  let correctMs = 0;
  let pitchSum = 0;
  let pitchCount = 0;
  let volumeSum = 0;
  let volumeCount = 0;

  for (const frame of noteFrames) {
    if (frame.isVoiceActive) {
      activeVoiceMs += FRAME_MS;
    }

    if (frame.detectedHz !== null && frame.isVoiceActive) {
      const pitchScore = getPitchScore(
        getCentsError(frame.detectedHz, note.targetHz),
      );
      pitchSum += pitchScore;
      pitchCount += 1;

      const volumeScore = frame.volumeDb !== null
        ? getVolumeScore(getVolumeCategory(frame.volumeDb))
        : 0;
      volumeSum += volumeScore;
      volumeCount += 1;

      if (pitchScore >= PITCH_CORRECT_THRESHOLD && volumeScore >= VOLUME_CORRECT_THRESHOLD) {
        correctMs += FRAME_MS;
      }
    }
  }

  const pitchScore = pitchCount > 0 ? pitchSum / pitchCount : 0;
  const volumeScore = volumeCount > 0 ? volumeSum / volumeCount : 0;
  let durationScore = Math.min(1, activeVoiceMs / note.durationMs);

  if (options?.heldPastEndMs && options.heldPastEndMs > 0) {
    const penalty = Math.min(0.5, (options.heldPastEndMs / note.durationMs) * 0.5);
    durationScore *= 1 - penalty;
  }

  const finalScore =
    pitchScore * 0.45 + volumeScore * 0.25 + durationScore * 0.3;

  return {
    noteId: note.id,
    activeVoiceMs,
    correctMs,
    pitchScore,
    volumeScore,
    durationScore,
    finalScore,
  };
}

export function aggregateExerciseScore(performances: NotePerformance[]): number {
  if (performances.length === 0) return 0;
  const total = performances.reduce((sum, p) => sum + p.finalScore, 0);
  return total / performances.length;
}

export function getFeedbackMessage(
  overallScore: number,
  scenarioLabel?: string,
): { title: string; body: string } {
  if (overallScore >= 0.85) {
    return {
      title: '¡Muy bien!',
      body: 'Mantuviste altura, volumen y duración de forma consistente en la mayoría de las notas.',
    };
  }
  if (overallScore >= 0.6) {
    return {
      title: 'Buen avance',
      body: 'Vas en la dirección correcta. Revisa las notas con menor puntaje e intenta sostener cada una con más estabilidad.',
    };
  }
  if (overallScore >= 0.35) {
    return {
      title: 'Sigue practicando',
      body: 'Algunas notas se acercaron al objetivo. Concéntrate en una nota a la vez y usa una intensidad cómoda.',
    };
  }
  return {
    title: 'Inténtalo de nuevo',
    body: scenarioLabel
      ? `La práctica simuló: ${scenarioLabel}. En una sesión real, canta cada nota cuando el indicador la alcance.`
      : 'Canta cada nota cuando el indicador la alcance y busca un volumen moderado.',
  };
}
