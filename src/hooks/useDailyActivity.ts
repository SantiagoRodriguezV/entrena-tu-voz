import { useCallback, useState } from 'react';
import { getTodayDateString } from '../data/demoDates';

export type DailyActivityState = {
  warmupCompletedDate: string | null;
  exerciseDates: string[];
  streakCount: number;
};

const INITIAL_STATE: DailyActivityState = {
  warmupCompletedDate: null,
  streakCount: 0,
  exerciseDates: [],
};

function uniqueDates(dates: string[]): string[] {
  return [...new Set(dates)];
}

function addDays(dateStr: string, delta: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function computeStreakCount(dates: string[], today: string = getTodayDateString()): number {
  const exerciseSet = new Set(dates);
  if (!exerciseSet.has(today)) return 0;

  let count = 0;
  let cursor = today;
  while (exerciseSet.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function useDailyActivity() {
  const [state, setState] = useState<DailyActivityState>(INITIAL_STATE);

  const isWarmupTokenActive = useCallback(
    (today: string = getTodayDateString()) => state.warmupCompletedDate === today,
    [state.warmupCompletedDate],
  );

  const isStreakActive = state.streakCount > 0;

  const recordVocalExercise = useCallback((today: string = getTodayDateString()) => {
    setState((prev) => {
      const exerciseDates = uniqueDates([...prev.exerciseDates, today]);
      return {
        ...prev,
        exerciseDates,
        streakCount: computeStreakCount(exerciseDates, today),
      };
    });
  }, []);

  const completeWarmup = useCallback((today: string = getTodayDateString()) => {
    setState((prev) => {
      const exerciseDates = uniqueDates([...prev.exerciseDates, today]);
      return {
        ...prev,
        warmupCompletedDate: today,
        exerciseDates,
        streakCount: computeStreakCount(exerciseDates, today),
      };
    });
  }, []);

  return {
    state,
    isStreakActive,
    isWarmupTokenActive,
    completeWarmup,
    recordVocalExercise,
  };
}
