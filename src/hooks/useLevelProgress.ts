import { useCallback, useState } from 'react';
import { INITIAL_LEVELS } from '../data/levels';
import {
  REPASO_PREREQUISITES,
  UNLOCK_ON_COMPLETE,
} from '../data/mapEdges';
import { Level } from '../types/exercise';

function canUnlockLevel(levels: Level[], targetId: string): boolean {
  if (targetId === 'repaso-1') {
    return REPASO_PREREQUISITES.every(
      (id) => levels.find((l) => l.id === id)?.status === 'completed',
    );
  }
  return true;
}

export function useLevelProgress() {
  const [levels, setLevels] = useState<Level[]>(INITIAL_LEVELS);
  const [recentlyUnlockedId, setRecentlyUnlockedId] = useState<string | null>(null);

  const completeLevel = useCallback((levelId: string) => {
    setLevels((prev) => {
      const index = prev.findIndex((l) => l.id === levelId);
      if (index < 0) return prev;

      const next = prev.map((l) => ({ ...l }));
      next[index].status = 'completed';

      const toUnlock = UNLOCK_ON_COMPLETE[levelId] ?? [];
      let unlockedId: string | null = null;

      for (const targetId of toUnlock) {
        const targetIndex = next.findIndex((l) => l.id === targetId);
        if (targetIndex < 0) continue;
        if (next[targetIndex].status !== 'locked') continue;
        if (!canUnlockLevel(next, targetId)) continue;

        next[targetIndex] = { ...next[targetIndex], status: 'unlocked' };
        unlockedId = targetId;
      }

      if (unlockedId) {
        setRecentlyUnlockedId(unlockedId);
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
