import { exerciseNotes } from '../data/exerciseNotes';
import { getCurrentTargetNote, isWithinNote } from './pitchUtils';
import { getVolumeCategory } from './volumeUtils';
import { DemoScenario, VocalFrame } from '../types/exercise';

let currentScenario: DemoScenario = 'good';

const MODERATE_DB = 70; // cómoda / habitual (manual pedagogía)
const LOW_DB = 55;
const HIGH_DB = 82;
const EXTREME_DB = 90;

export function setDemoScenario(scenario: DemoScenario): void {
  currentScenario = scenario;
}

export function getDemoScenario(): DemoScenario {
  return currentScenario;
}

export function resetDemoEngine(): void {
  currentScenario = 'good';
}

function getScenarioPitchOffset(scenario: DemoScenario, timeMs: number): number {
  switch (scenario) {
    case 'good':
      return Math.sin(timeMs / 400) * 8;
    case 'slightlyOffPitch':
      return 35 + Math.sin(timeMs / 500) * 10;
    case 'wrongPitch':
      return 120 + Math.sin(timeMs / 300) * 15;
    case 'interrupted':
      return Math.sin(timeMs / 350) * 6;
    default:
      return Math.sin(timeMs / 400) * 8;
  }
}

function getScenarioVolume(scenario: DemoScenario): number {
  switch (scenario) {
    case 'tooLowVolume':
      return LOW_DB;
    case 'tooHighVolume':
      return HIGH_DB;
    case 'extremeVolume':
      return EXTREME_DB;
    default:
      return MODERATE_DB + Math.sin(Date.now() / 300) * 3;
  }
}

function isVoiceActiveForScenario(scenario: DemoScenario, timeMs: number, noteStart: number): boolean {
  if (scenario !== 'interrupted') return true;

  const relative = timeMs - noteStart;
  const cycle = 900;
  const phase = relative % cycle;
  return phase < 500;
}

export function getFrameAt(timeMs: number): VocalFrame {
  const note = getCurrentTargetNote(timeMs, exerciseNotes);
  const targetHz = note?.targetHz ?? exerciseNotes[0].targetHz;
  const noteStart = note?.startMs ?? 0;
  const inNote = note ? isWithinNote(timeMs, note) : false;

  const isVoiceActive =
    inNote && isVoiceActiveForScenario(currentScenario, timeMs, noteStart);

  let detectedHz: number | null = null;
  let volumeDb: number | null = null;

  if (isVoiceActive) {
    const offset = getScenarioPitchOffset(currentScenario, timeMs);
    detectedHz = targetHz * Math.pow(2, offset / 1200);
    volumeDb = getScenarioVolume(currentScenario);
  }

  const volumeCategory = volumeDb !== null
    ? getVolumeCategory(volumeDb)
    : 'low';

  return {
    timeMs,
    detectedHz,
    rawHz: detectedHz,
    pitchConfidence: isVoiceActive ? 0.85 : 0,
    relativeDb: volumeDb,
    volumeDb,
    volumeCategory,
    isVoiceActive,
    harmonicityScore: null,
    noiseRatioProxy: null,
    stabilityScore: null,
    clippingDetected: volumeCategory === 'extreme',
    captureConfidence: isVoiceActive ? 0.85 : 0.2,
  };
}

export function getScenarioLabel(scenario: DemoScenario): string {
  const labels: Record<DemoScenario, string> = {
    good: 'Buena ejecución',
    slightlyOffPitch: 'Ligeramente desafinado',
    tooLowVolume: 'Volumen bajo',
    tooHighVolume: 'Volumen alto',
    extremeVolume: 'Volumen extremo',
    interrupted: 'Emisión interrumpida',
    wrongPitch: 'Nota incorrecta',
  };
  return labels[scenario];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  'good',
  'slightlyOffPitch',
  'tooLowVolume',
  'tooHighVolume',
  'extremeVolume',
  'interrupted',
  'wrongPitch',
];
