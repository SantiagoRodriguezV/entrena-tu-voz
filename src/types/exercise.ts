export type LevelStatus = 'completed' | 'unlocked' | 'locked';

export type LevelCategory = 'canto' | 'distorsiones';

export type Level = {
  id: string;
  title: string;
  status: LevelStatus;
  category: LevelCategory;
  mapNumber: number;
  lessonId?: string;
  lessonNumber?: number;
  description: string;
  estimatedMinutes: number;
};

export type MainTab = 'desafios' | 'aprende' | 'entrena' | 'perfil';

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
  | 'lessonIntro'
  | 'rotateDevice'
  | 'exerciseListen'
  | 'vocalExercise'
  | 'exerciseMiniResult'
  | 'lessonCompleted';

export type NodeLayoutMetrics = {
  cx: number;
  cy: number;
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

export const ASSISTIVE_MARGIN_CENTS = 65;
export const SNAP_STRENGTH = 0.65;
