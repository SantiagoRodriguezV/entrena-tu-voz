import { PitchStabilizer } from './pitchStabilizer';
import { getVolumeCategory } from './volumeUtils';
import { evaluateCaptureQuality } from './evaluation/captureQuality';
import { VocalFrame } from '../types/exercise';
import { Platform } from 'react-native';

// relativeDb / volumeDb are NOT calibrated dB SPL.
// They are relative mic levels derived from tuner rmsDb (approx. dBFS).

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
    const mod = require('react-native-tuner-engine') as {
      TunerEngine: TunerEngineType;
    };
    return mod.TunerEngine ?? null;
  } catch {
    tunerLoadFailed = true;
    return null;
  }
}

/** Map tuner rmsDb (≈dBFS) to a 30–95 relative display scale. */
function rmsToRelativeDb(rmsDb: number): number {
  return Math.max(30, Math.min(95, 90 + rmsDb));
}

function buildFrame(nowMs: number): VocalFrame {
  const hasPitch = latestPitch?.hasPitch ?? false;
  const pitchConfidence = latestPitch?.confidence ?? 0;
  const rawHz = hasPitch && latestPitch && latestPitch.frequency > 0
    ? latestPitch.frequency
    : null;
  const rmsDb = latestPitch?.rmsDb ?? -80;
  // Real sung detection only — do NOT include stabilizer hold (avoids ghost scoring).
  const voiceDetected =
    hasPitch && pitchConfidence >= 0.55 && rawHz !== null;

  const displayHz = stabilizer.stabilize(rawHz, voiceDetected, nowMs);
  const relativeDb = voiceDetected ? rmsToRelativeDb(rmsDb) : null;
  const volumeCategory =
    relativeDb !== null ? getVolumeCategory(relativeDb) : 'low';

  const capture = evaluateCaptureQuality({
    pitchConfidence,
    isVoiceActive: voiceDetected,
    relativeDb,
    volumeCategory,
  });

  return {
    timeMs: nowMs - sessionStartMs,
    detectedHz: displayHz,
    rawHz: voiceDetected ? rawHz : null,
    pitchConfidence,
    relativeDb,
    volumeDb: relativeDb,
    volumeCategory,
    isVoiceActive: voiceDetected,
    harmonicityScore: null,
    noiseRatioProxy: null,
    stabilityScore: null,
    clippingDetected: capture.clippingDetected,
    captureConfidence: capture.captureConfidence,
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
      maxFrequency: 1200,
      noiseGateDb: -50,
      confidenceThreshold: 0.5,
      emaAlpha: 0.32,
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
