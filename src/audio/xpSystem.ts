import type { VoiceTypeId } from '../data/voiceTypeRanges';
import type { UserVocalCalibration } from './userVocalProfile';

export type UserProgress = {
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  /** Estimated or selected voice type; null until set. */
  voiceTypeId?: VoiceTypeId | null;
  /** Personal pitch/volume calibration; null until mini-calibration. */
  vocalCalibration?: UserVocalCalibration | null;
};

const XP_PER_LEVEL = 100;
const MIN_XP_PER_EXERCISE = 10;

export function calculateExerciseXp(accuracyPercent: number): number {
  const clamped = Math.max(0, Math.min(100, accuracyPercent));
  if (clamped < PAUSE_THRESHOLD) return MIN_XP_PER_EXERCISE;
  return Math.max(MIN_XP_PER_EXERCISE, Math.round(clamped));
}

/** XP estimado al completar una lección con precisión perfecta */
export function estimateLessonTotalXp(exerciseCount: number): number {
  return exerciseCount * calculateExerciseXp(100);
}

const PAUSE_THRESHOLD = 20;

export function getLevelFromTotalXp(
  totalXp: number,
  voiceTypeId: VoiceTypeId | null = null,
  vocalCalibration: UserVocalCalibration | null = null,
): UserProgress {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  return {
    totalXp,
    level,
    xpInLevel,
    xpToNextLevel: XP_PER_LEVEL,
    voiceTypeId,
    vocalCalibration,
  };
}

export function getInitialUserProgress(): UserProgress {
  return getLevelFromTotalXp(0, null, null);
}

export function addXp(current: UserProgress, earnedXp: number): UserProgress {
  return getLevelFromTotalXp(
    Math.max(0, current.totalXp + earnedXp),
    current.voiceTypeId ?? null,
    current.vocalCalibration ?? null,
  );
}

export function setUserVoiceType(
  current: UserProgress,
  voiceTypeId: VoiceTypeId | null,
): UserProgress {
  return {
    ...current,
    voiceTypeId,
  };
}

export function setUserVocalCalibration(
  current: UserProgress,
  vocalCalibration: UserVocalCalibration | null,
): UserProgress {
  return {
    ...current,
    vocalCalibration,
  };
}
