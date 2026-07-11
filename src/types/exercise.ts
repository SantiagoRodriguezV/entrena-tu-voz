export type LevelStatus = 'completed' | 'unlocked' | 'locked';

export type LevelCategory = 'canto' | 'distorsiones';

export type MapColumn = 'left' | 'right' | 'center';

export type MapPlatform = 'basic' | 'extremo';

export type Level = {
  id: string;
  title: string;
  status: LevelStatus;
  category: LevelCategory;
  mapColumn: MapColumn;
  mapRow: number;
  displayCode: string;
  platform: MapPlatform;
  lessonId?: string;
  lessonNumber?: number;
  sectionLevel?: number;
  description: string;
  estimatedMinutes: number;
};

export type MainTab = 'menu' | 'aprende' | 'entrena' | 'desafios';

export type { VoiceTypeId } from '../data/voiceTypeRanges';

export type ExerciseNote = {
  id: string;
  label: string;
  targetHz: number;
  startMs: number;
  durationMs: number;
};

export type VolumeCategory = 'low' | 'moderate' | 'high' | 'extreme';

export type CoachingMessage =
  | 'higher'
  | 'lower'
  | 'keepGoing'
  | 'holdNote'
  | 'tooQuiet'
  | 'tooLoud'
  | 'noVoice'
  | 'unstable'
  | 'good'
  | 'uncertain'
  | 'reachNote'
  | 'pitchOkTooLoud'
  | 'pitchOkExtreme';

/** Relative mic level — not calibrated dB SPL. */
export type VocalFrame = {
  timeMs: number;
  /** Stabilized Hz for UI indicator. */
  detectedHz: number | null;
  /** Lightly gated raw Hz for scoring (more faithful). */
  rawHz: number | null;
  pitchConfidence: number;
  relativeDb: number | null;
  /** Alias of relativeDb for existing UI/scoring call sites. */
  volumeDb: number | null;
  volumeCategory: VolumeCategory;
  isVoiceActive: boolean;
  harmonicityScore: number | null;
  noiseRatioProxy: number | null;
  stabilityScore: number | null;
  clippingDetected: boolean;
  captureConfidence: number;
};

/** Frame enriched with the active exercise note target. */
export type EnrichedVocalFrame = VocalFrame & {
  targetHz: number | null;
  pitchErrorCents: number | null;
};

export type DemoScenario =
  | 'good'
  | 'slightlyOffPitch'
  | 'tooLowVolume'
  | 'tooHighVolume'
  | 'extremeVolume'
  | 'interrupted'
  | 'wrongPitch';

export type NotePerformance = {
  noteId: string;
  activeVoiceMs: number;
  correctMs: number;
  pitchScore: number;
  volumeScore: number;
  durationScore: number;
  continuityScore: number;
  stabilityScore: number;
  captureScore: number;
  finalScore: number;
};

export type NoteEvaluation = NotePerformance;

export type ExerciseEvaluation = {
  overallScore: number;
  noteEvaluations: NoteEvaluation[];
};

export type AppScreen =
  | 'home'
  | 'warmupIntro'
  | 'warmupCompleted'
  | 'lessonIntro'
  | 'rotateDevice'
  | 'exerciseReady'
  | 'vocalCalibration'
  | 'exerciseListen'
  | 'vocalExercise'
  | 'exerciseMiniResult'
  | 'lessonCompleted';

export type SessionMode = 'warmup' | 'lesson';

export type NodeLayoutMetrics = {
  cx: number;
  cy: number;
  top: number;
  bottom: number;
};

export type ExerciseSessionResult = {
  exerciseIndex: number;
  performances: NotePerformance[];
  accuracyPercent: number;
  xpEarned: number;
  correctNotes: number;
  totalNotes: number;
};

export const PITCH_THRESHOLDS = {
  /** Within ~1/4 tone — strong match (equal temperament reference: A3=440 Hz). */
  perfectCents: 25,
  /** Within ~1/2 tone — acceptable for beginners matching a target note. */
  goodCents: 50,
  /** Within ~1 semitone — partial credit. */
  partialCents: 100,
  /** Beyond ~1.5 semitones — weak / miss. */
  weakCents: 180,
} as const;

/** Pitch assist only when already close to target; scoring always uses raw Hz. */
export const ASSISTIVE_MARGIN_CENTS = 25;
/** Subtle pull toward target (0 = off, 1 = full snap). */
export const SNAP_STRENGTH = 0.15;
/** Timing assist for indicator only; kept near zero so progress is not faked. */
export const HORIZONTAL_SNAP_STRENGTH = 0;
