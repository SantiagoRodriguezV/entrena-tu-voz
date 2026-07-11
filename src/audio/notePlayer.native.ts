import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { ExerciseNote } from '../types/exercise';
import { NotePlaybackOptions } from './notePlayer';

function toBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    result += chars[a >> 2];
    result += chars[((a & 3) << 4) | (b >> 4)];
    result += i + 1 < bytes.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
    result += i + 2 < bytes.length ? chars[c & 63] : '=';
  }
  return result;
}

function encodeWavBase64(frequency: number, durationMs: number): string {
  const sampleRate = 44100;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.35;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  return `data:audio/wav;base64,${toBase64(bytes)}`;
}

let activePlayer: ReturnType<typeof createAudioPlayer> | null = null;

async function playTone(hz: number, durationMs: number): Promise<void> {
  const uri = encodeWavBase64(hz, durationMs);
  if (activePlayer) {
    activePlayer.remove();
    activePlayer = null;
  }
  activePlayer = createAudioPlayer(uri);
  activePlayer.volume = 1;
  activePlayer.play();
  await new Promise((resolve) => setTimeout(resolve, durationMs + 120));
}

/**
 * Play demo tones through the speaker.
 * Callers should pause the vocal mic while this runs — Android cannot
 * reliably play and capture at the same time with the tuner session.
 */
export async function playNoteSequence(
  notes: ExerciseNote[],
  options?: NotePlaybackOptions,
): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: false,
    shouldRouteThroughEarpiece: false,
    interruptionMode: 'duckOthers',
  });
  const gapMs = options?.gapMs ?? 0;

  try {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      options?.onNoteStart?.(note);
      await playTone(note.targetHz, note.durationMs);
      options?.onNoteEnd?.(note);
      if (i < notes.length - 1 && gapMs > 0) {
        await new Promise((r) => setTimeout(r, gapMs));
      }
    }
  } finally {
    // Re-open recording path so pitch detection can resume after demo.
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
  }
}

export function stopNotePlayback(): void {
  if (activePlayer) {
    activePlayer.remove();
    activePlayer = null;
  }
}

export type { NotePlaybackOptions };
