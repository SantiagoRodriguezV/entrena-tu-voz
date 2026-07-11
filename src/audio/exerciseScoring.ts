import { getPitchScore, isWithinNote } from './pitchUtils';
import {
  getVolumeCategory,
  getVolumeCategoryForUser,
  getVolumeScore,
} from './volumeUtils';
import {
  evaluateNote,
  scoreNotePerformance,
  ScoreNoteOptions,
} from './evaluation/noteEvaluator';
import { evaluateExercise } from './evaluation/exerciseEvaluator';
import { ExerciseNote, NotePerformance, VocalFrame } from '../types/exercise';

export type { ScoreNoteOptions };
export { evaluateNote, scoreNotePerformance };

export function aggregateExerciseScore(performances: NotePerformance[]): number {
  return evaluateExercise(performances).overallScore;
}

export function getFeedbackMessage(
  overallScore: number,
  scenarioLabel?: string,
): { title: string; body: string } {
  if (overallScore >= 0.85) {
    return {
      title: '¡Muy bien!',
      body: 'Te acercaste al patrón esperado. La emisión fue estable y el volumen moderado en la mayoría de las notas.',
    };
  }
  if (overallScore >= 0.6) {
    return {
      title: '¡Casi casi!',
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
    title: 'No pude escucharte bien',
    body: scenarioLabel
      ? `La práctica simuló: ${scenarioLabel}. En una sesión real, canta cada nota cuando el indicador la alcance.`
      : 'Asegúrate de cantar con voz clara y un volumen moderado cerca del micrófono.',
  };
}

// Re-export helpers still used by older call sites that imported from here.
export { getPitchScore, getVolumeCategory, getVolumeCategoryForUser, getVolumeScore, isWithinNote };
export type { ExerciseNote, NotePerformance, VocalFrame };
