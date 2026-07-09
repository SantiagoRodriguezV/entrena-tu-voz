import { useCallback, useState } from 'react';
import { INITIAL_LEVELS } from '../data/levels';
import { Level } from '../types/exercise';

export function useLevelProgress() {
  const [levels, setLevels] = useState<Level[]>(INITIAL_LEVELS);
  const [recentlyUnlockedId, setRecentlyUnlockedId] = useState<string | null>(null);

  const completeLevel = useCallback((levelId: string) => {
    setLevels((prev) => {
      const index = prev.findIndex((l) => l.id === levelId);
      if (index < 0) return prev;

      const next = prev.map((l) => ({ ...l }));
      next[index].status = 'completed';

      const nextLevel = next[index + 1];
      if (nextLevel && nextLevel.status === 'locked') {
        next[index + 1] = { ...nextLevel, status: 'unlocked' };
        setRecentlyUnlockedId(nextLevel.id);
      }

      return next;
    });
  }, []);

  const clearUnlockAnimation = useCallback(() => {
    setRecentlyUnlockedId(null);
  }, []);

  const getLevelById = useCallback(
    (id: string) => levels.find((l) => l.id === id),
    [levels],
  );

  return {
    levels,
    recentlyUnlockedId,
    completeLevel,
    clearUnlockAnimation,
    getLevelById,
  };
}
