import { ExerciseNote } from '../types/exercise';
import { NotePlaybackOptions } from './notePlayer';

let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(hz: number, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = hz;
    gain.gain.value = 0.25;

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();

    const fadeOut = Math.min(80, durationMs * 0.15);
    const endTime = ctx.currentTime + durationMs / 1000;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, endTime - fadeOut / 1000);

    oscillator.stop(endTime);

    setTimeout(resolve, durationMs + 120);
  });
}

export async function playNoteSequence(
  notes: ExerciseNote[],
  options?: NotePlaybackOptions,
): Promise<void> {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const gapMs = options?.gapMs ?? 0;

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    options?.onNoteStart?.(note);
    await playTone(note.targetHz, note.durationMs);
    options?.onNoteEnd?.(note);
    if (i < notes.length - 1 && gapMs > 0) {
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
}

export function stopNotePlayback(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

export type { NotePlaybackOptions };
