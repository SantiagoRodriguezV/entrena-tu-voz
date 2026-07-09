import { Platform } from 'react-native';
import { PitchStabilizer } from './pitchStabilizer';
import { getVolumeCategory } from './volumeUtils';
import { VocalFrame } from '../types/exercise';

// Demo note: this is not calibrated dB SPL.
// rmsDb from the tuner engine is relative dBFS for visual feedback.

type PitchEvent = {
  hasPitch: boolean;
  frequency: number;
  confidence: number;
  rmsDb: number;
};

type TunerEngineType = {
  requestPermission(): Promise<boolean>;
  configure(opts: object): Promise<void>;
  setInstrument(name: string): void;
  onPitch(callback: (event: PitchEvent) => void): () => void;
  start(): Promise<void>;
  stop(): Promise<void>;
};

type FrameListener = (frame: VocalFrame) => void;

let stabilizer = new PitchStabilizer();
let listeners: FrameListener[] = [];
let unsubscribePitch: (() => void) | null = null;
let isRunning = false;
let sessionStartMs = 0;
let latestPitch: PitchEvent | null = null;
let emitInterval: ReturnType<typeof setInterval> | null = null;
let tunerLoadFailed = false;

function getTunerEngine(): TunerEngineType | null {
  if (tunerLoadFailed || Platform.OS === 'web') {
    return null;
  }
  try {
    // Lazy require: avoids TurboModule crash on web and missing native module in Expo Go.
    const mod = require('react-native-tuner-engine') as {
      TunerEngine: TunerEngineType;
    };
    return mod.TunerEngine ?? null;
  } catch (error) {
    tunerLoadFailed = true;
    return null;
  }
}

function rmsToDisplayDb(rmsDb: number): number {
  return Math.max(30, Math.min(95, 90 + rmsDb));
}

function buildFrame(nowMs: number): VocalFrame {
  const hasPitch = latestPitch?.hasPitch ?? false;
  const rawHz = hasPitch && latestPitch ? latestPitch.frequency : null;
  const rmsDb = latestPitch?.rmsDb ?? -80;
  const isVoiceActive = hasPitch && (latestPitch?.confidence ?? 0) >= 0.5;

  const stabilizedHz = stabilizer.stabilize(rawHz, isVoiceActive, nowMs);
  const volumeDb = isVoiceActive || stabilizer.isVoiceHeld ? rmsToDisplayDb(rmsDb) : null;

  return {
    timeMs: nowMs - sessionStartMs,
    detectedHz: stabilizedHz,
    volumeDb,
    volumeCategory: volumeDb !== null ? getVolumeCategory(volumeDb) : 'low',
    isVoiceActive: isVoiceActive || stabilizer.isVoiceHeld,
  };
}

function emitFrame(): void {
  const frame = buildFrame(Date.now());
  listeners.forEach((fn) => fn(frame));
}

export async function startRealVocalEngine(): Promise<boolean> {
  if (isRunning) return true;

  const TunerEngine = getTunerEngine();
  if (!TunerEngine) {
    return false;
  }

  try {
    const granted = await TunerEngine.requestPermission();
    if (!granted) {
      return false;
    }

    await TunerEngine.configure({
      minFrequency: 80,
      maxFrequency: 500,
      noiseGateDb: -50,
      confidenceThreshold: 0.55,
      emaAlpha: 0.25,
      quality: 'balanced',
    });
    TunerEngine.setInstrument('chromatic');

    stabilizer = new PitchStabilizer();
    sessionStartMs = Date.now();
    latestPitch = null;

    unsubscribePitch = TunerEngine.onPitch((event) => {
      latestPitch = event;
    });

    await TunerEngine.start();
    emitInterval = setInterval(emitFrame, 50);
    isRunning = true;
    return true;
  } catch {
    await stopRealVocalEngine();
    return false;
  }
}

export async function stopRealVocalEngine(): Promise<void> {
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }
  if (unsubscribePitch) {
    unsubscribePitch();
    unsubscribePitch = null;
  }
  const TunerEngine = getTunerEngine();
  if (TunerEngine) {
    try {
      await TunerEngine.stop();
    } catch {
      // ignore
    }
  }
  isRunning = false;
  latestPitch = null;
  stabilizer.reset();
}

export function subscribeRealVocalEngine(listener: FrameListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function isRealVocalEngineRunning(): boolean {
  return isRunning;
}

export function isRealVocalEngineSupported(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

export function getLatestVocalFrame(): VocalFrame | null {
  if (!isRunning) return null;
  return buildFrame(Date.now());
}
