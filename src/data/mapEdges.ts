export type MapEdge = {
  from: string;
  to: string;
};

export const MAP_EDGES: MapEdge[] = [
  { from: 'c1', to: 'c2' },
  { from: 'c1', to: 'd1' },
  { from: 'c2', to: 'c3' },
  { from: 'd1', to: 'd2' },
  { from: 'c3', to: 'c4' },
  { from: 'c4', to: 'c5' },
  { from: 'c5', to: 'repaso-1' },
  { from: 'd2', to: 'repaso-1' },
];

/** Levels unlocked when a given level is completed */
export const UNLOCK_ON_COMPLETE: Record<string, string[]> = {
  c1: ['c2', 'd1'],
  c2: ['c3'],
  d1: ['d2'],
  c3: ['c4'],
  c4: ['c5'],
  c5: ['repaso-1'],
  d2: ['repaso-1'],
};

/** Repaso requires both branch ends completed */
export const REPASO_PREREQUISITES = ['c5', 'd2'] as const;
