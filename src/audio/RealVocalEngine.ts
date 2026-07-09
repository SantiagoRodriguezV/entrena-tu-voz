import { VocalFrame } from '../types/exercise';

type FrameListener = (frame: VocalFrame) => void;

export async function startRealVocalEngine(): Promise<boolean> {
  return false;
}

export async function stopRealVocalEngine(): Promise<void> {}

export function subscribeRealVocalEngine(_listener: FrameListener): () => void {
  return () => {};
}

export function isRealVocalEngineRunning(): boolean {
  return false;
}

export function isRealVocalEngineSupported(): boolean {
  return false;
}

export function getLatestVocalFrame(): VocalFrame | null {
  return null;
}
