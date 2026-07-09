import { ExerciseNote } from '../types/exercise';

export type NotePlaybackOptions = {
  onNoteStart?: (note: ExerciseNote) => void;
  onNoteEnd?: (note: ExerciseNote) => void;
  gapMs?: number;
};

export async function playNoteSequence(
  _notes: ExerciseNote[],
  _options?: NotePlaybackOptions,
): Promise<void> {}

export function stopNotePlayback(): void {}
