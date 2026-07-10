import { scaleH, scaleW } from './responsive';

export type WarmupLaneMetrics = {
  laneHeight: number;
  noteHeight: number;
  noteWidth: number;
  noteGap: number;
  playheadX: number;
  pixelsPerMs: number;
};

/** @deprecated use getWarmupLaneMetrics */
export const WARMUP_LANE_HEIGHT = 160;
/** @deprecated use getWarmupLaneMetrics */
export const WARMUP_NOTE_HEIGHT = 32;
/** @deprecated use getWarmupLaneMetrics */
export const WARMUP_NOTE_WIDTH = 100;
/** @deprecated use getWarmupLaneMetrics */
export const WARMUP_NOTE_GAP = 20;
/** @deprecated use getWarmupLaneMetrics */
export const WARMUP_PLAYHEAD_X = 72;
/** @deprecated use getWarmupLaneMetrics */
export const WARMUP_PIXELS_PER_MS = 0.1;

export function getWarmupLaneMetrics(width: number, height: number): WarmupLaneMetrics {
  const isLandscape = width > height;
  const laneHeight = isLandscape
    ? Math.max(100, Math.min(scaleH(140, height), height * 0.55))
    : Math.max(120, scaleH(160, height));

  return {
    laneHeight,
    noteHeight: Math.max(24, scaleH(32, height) * (isLandscape ? 0.85 : 1)),
    noteWidth: Math.max(72, scaleW(100, width) * (isLandscape ? 1.1 : 1)),
    noteGap: Math.max(12, scaleW(20, width)),
    playheadX: Math.max(48, scaleW(72, width)),
    pixelsPerMs: isLandscape ? 0.12 : 0.1,
  };
}

export function warmupTimeToX(timeMs: number, pixelsPerMs: number): number {
  return timeMs * pixelsPerMs;
}
