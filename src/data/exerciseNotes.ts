import { ExerciseNote } from '../types/exercise';

export const NOTE_DURATION_MS = 1000;

export type NoteDefinition = {
  id: string;
  label: string;
  targetHz: number;
};

export const NOTE_POOL = {
  c3: { id: 'n-c3', label: 'C3', targetHz: 130.81 },
  d3: { id: 'n-d3', label: 'D3', targetHz: 146.83 },
  e3: { id: 'n-e3', label: 'E3', targetHz: 164.81 },
  g3: { id: 'n-g3', label: 'G3', targetHz: 196.0 },
} as const satisfies Record<string, NoteDefinition>;

export function buildFlatNotes(definitions: NoteDefinition[]): ExerciseNote[] {
  return definitions.map((note, index) => ({
    id: note.id,
    label: note.label,
    targetHz: note.targetHz,
    startMs: index * NOTE_DURATION_MS,
    durationMs: NOTE_DURATION_MS,
  }));
}

export function getExerciseDurationMs(notes: ExerciseNote[]): number {
  if (notes.length === 0) return 0;
  const last = notes[notes.length - 1];
  return last.startMs + last.durationMs;
}

/** @deprecated Legacy demos — use lesson exercise data instead */
export const exerciseNotes = buildFlatNotes([NOTE_POOL.c3, NOTE_POOL.d3, NOTE_POOL.e3, NOTE_POOL.g3]);

export const EXERCISE_DURATION_MS = getExerciseDurationMs(exerciseNotes);
