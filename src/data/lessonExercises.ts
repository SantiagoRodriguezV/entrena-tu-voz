import { ExerciseNote } from '../types/exercise';
import {
  buildFlatNotes,
  getExerciseDurationMs,
  NOTE_POOL,
} from './exerciseNotes';

export type LessonExercise = {
  id: string;
  index: number;
  title: string;
  lessonTitle: string;
  vowelLabel: string;
  notes: ExerciseNote[];
};

const { c3, d3, e3, g3 } = NOTE_POOL;

export const REGISTER_CHANGE_LESSON: LessonExercise[] = [
  {
    id: 'ex1',
    index: 1,
    title: 'Una nota',
    lessonTitle: 'CALENTAMIENTO',
    vowelLabel: 'AA',
    notes: buildFlatNotes([c3]),
  },
  {
    id: 'ex2',
    index: 2,
    title: 'Dos notas ascendentes',
    lessonTitle: 'CALENTAMIENTO',
    vowelLabel: 'AA',
    notes: buildFlatNotes([c3, d3]),
  },
  {
    id: 'ex3',
    index: 3,
    title: 'Tres notas ascendentes',
    lessonTitle: 'CALENTAMIENTO',
    vowelLabel: 'AA',
    notes: buildFlatNotes([c3, d3, e3]),
  },
  {
    id: 'ex4',
    index: 4,
    title: 'Cuatro notas ascendentes',
    lessonTitle: 'CALENTAMIENTO',
    vowelLabel: 'AA',
    notes: buildFlatNotes([c3, d3, e3, g3]),
  },
  {
    id: 'ex5',
    index: 5,
    title: 'Descenso',
    lessonTitle: 'CALENTAMIENTO',
    vowelLabel: 'AA',
    notes: buildFlatNotes([g3, e3, d3, c3]),
  },
  {
    id: 'ex6',
    index: 6,
    title: 'Sube y baja',
    lessonTitle: 'CALENTAMIENTO',
    vowelLabel: 'AA',
    notes: buildFlatNotes([c3, d3, g3, e3]),
  },
];

export function getLessonExercise(index: number): LessonExercise | null {
  return REGISTER_CHANGE_LESSON[index] ?? null;
}

export function getLessonExerciseDuration(index: number): number {
  const ex = getLessonExercise(index);
  if (!ex) return 0;
  return getExerciseDurationMs(ex.notes);
}

export const LESSON_EXERCISE_COUNT = REGISTER_CHANGE_LESSON.length;
