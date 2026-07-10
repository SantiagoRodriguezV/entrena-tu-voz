import { LessonExercise } from './lessonExercises';
import { REGISTER_CHANGE_LESSON } from './lessonExercises';
import { getExerciseDurationMs } from './exerciseNotes';

/** Placeholder: first 3 calentamiento exercises — adjust count here later */
export const WARMUP_EXERCISES: LessonExercise[] = REGISTER_CHANGE_LESSON.slice(0, 3);

export const WARMUP_EXERCISE_COUNT = WARMUP_EXERCISES.length;

export function getWarmupExercise(index: number): LessonExercise | null {
  return WARMUP_EXERCISES[index] ?? null;
}

export function getWarmupExerciseDuration(index: number): number {
  const ex = getWarmupExercise(index);
  if (!ex) return 0;
  return getExerciseDurationMs(ex.notes);
}
