export type UserProgress = {
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
};

const XP_PER_LEVEL = 100;
const MIN_XP_PER_EXERCISE = 10;

export function calculateExerciseXp(accuracyPercent: number): number {
  const clamped = Math.max(0, Math.min(100, accuracyPercent));
  if (clamped < PAUSE_THRESHOLD) return MIN_XP_PER_EXERCISE;
  return Math.max(MIN_XP_PER_EXERCISE, Math.round(clamped));
}

const PAUSE_THRESHOLD = 20;

export function getLevelFromTotalXp(totalXp: number): UserProgress {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  return {
    totalXp,
    level,
    xpInLevel,
    xpToNextLevel: XP_PER_LEVEL,
  };
}

export function getInitialUserProgress(): UserProgress {
  return getLevelFromTotalXp(0);
}

export function addXp(current: UserProgress, earnedXp: number): UserProgress {
  return getLevelFromTotalXp(Math.max(0, current.totalXp + earnedXp));
}
