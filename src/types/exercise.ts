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

export type ExerciseNote = {
  id: string;
  label: string;
  targetHz: number;
  startMs: number;
  durationMs: number;
};

export type VolumeCategory = 'low' | 'moderate' | 'high' | 'extreme';

export type VocalFrame = {
  timeMs: number;
  detectedHz: number | null;
  volumeDb: number | null;
  volumeCategory: VolumeCategory;
  isVoiceActive: boolean;
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
  finalScore: number;
};

export type AppScreen =
  | 'home'
  | 'warmupIntro'
  | 'warmupCompleted'
  | 'lessonIntro'
  | 'rotateDevice'
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
  perfectCents: 25,
  goodCents: 50,
  partialCents: 100,
  weakCents: 180,
} as const;

/** Pitch assist only when already close to target; scoring always uses raw Hz. */
export const ASSISTIVE_MARGIN_CENTS = 25;
/** Subtle pull toward target (0 = off, 1 = full snap). */
export const SNAP_STRENGTH = 0.15;
/** Timing assist for indicator only; kept near zero so progress is not faked. */
export const HORIZONTAL_SNAP_STRENGTH = 0;
