import { ExerciseEvaluation, NoteEvaluation } from '../../types/exercise';

export function evaluateExercise(
  noteEvaluations: NoteEvaluation[],
): ExerciseEvaluation {
  if (noteEvaluations.length === 0) {
    return { overallScore: 0, noteEvaluations: [] };
  }

  const total = noteEvaluations.reduce((sum, n) => sum + n.finalScore, 0);
  return {
    overallScore: total / noteEvaluations.length,
    noteEvaluations,
  };
}

export function exerciseAccuracyPercent(
  noteEvaluations: NoteEvaluation[],
): number {
  return Math.round(evaluateExercise(noteEvaluations).overallScore * 100);
}
