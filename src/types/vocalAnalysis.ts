export type ResearchScenario =
  | 'successful'
  | 'partial'
  | 'insufficient_audio'
  | 'interrupted'
  | 'possible_effort';

export type VocalResultType =
  | 'successful'
  | 'partial'
  | 'insufficient_audio'
  | 'interrupted'
  | 'possible_effort';

export type VocalAnalysisResult = {
  voiceDetected: boolean;
  durationScore: number;
  pitchDirectionScore: number;
  continuityScore: number;
  registerTransitionScore: number;
  effortWarning: boolean;
  confidence: number;
  resultType: VocalResultType;
};

export type BasicAudioMetrics = {
  voiceDetected: boolean;
  completedDuration: number;
  averageInputLevel: number;
  hadLongSilences: boolean;
  exerciseDurationMs: number;
};

export type AppStep =
  | 'welcome'
  | 'learningPath'
  | 'concept'
  | 'preparation'
  | 'exercise'
  | 'analysis'
  | 'feedback'
  | 'completion';

export type MicPermissionStatus = 'undetermined' | 'granted' | 'denied';
