import { ExerciseNote } from '../types/exercise';

/** Landscape design canvas: margins 84/80/80/80 + band 891×252. */
export const EXERCISE_LANDSCAPE_WIDTH = 1055;
export const EXERCISE_LANDSCAPE_HEIGHT = 412;

export const EXERCISE_BAND = {
  width: 891,
  height: 252,
  marginLeft: 84,
  marginRight: 80,
  marginTop: 80,
  marginBottom: 80,
} as const;

export const EXERCISE_GRID = {
  width: 727,
  height: 230,
  marginTop: 12,
  marginBottom: 11,
  gutter: 8,
  rows: 6,
} as const;

export type ExerciseBandMetrics = {
  bandWidth: number;
  bandHeight: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  gridWidth: number;
  gridHeight: number;
  gridOffsetX: number;
  gridOffsetY: number;
  gutter: number;
  rowHeight: number;
  rows: number;
};

export type NoteGridCell = {
  note: ExerciseNote;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  row: number;
  column: number;
};

function scaleLandscape(size: number, axis: 'w' | 'h', width: number, height: number): number {
  if (axis === 'w') return (width / EXERCISE_LANDSCAPE_WIDTH) * size;
  return (height / EXERCISE_LANDSCAPE_HEIGHT) * size;
}

export function getExerciseBandMetrics(
  width: number,
  height: number,
): ExerciseBandMetrics {
  const isLandscape = width > height;
  const sw = (size: number) =>
    isLandscape ? scaleLandscape(size, 'w', width, height) : (width / 412) * size * 0.45;
  const sh = (size: number) =>
    isLandscape ? scaleLandscape(size, 'h', width, height) : (height / 891) * size;

  const bandWidth = sw(EXERCISE_BAND.width);
  const bandHeight = sh(EXERCISE_BAND.height);
  const gridWidth = sw(EXERCISE_GRID.width);
  const gridHeight = sh(EXERCISE_GRID.height);
  const gutter = sw(EXERCISE_GRID.gutter);
  const gridOffsetY = sh(EXERCISE_GRID.marginTop);
  const gridOffsetX = (bandWidth - gridWidth) / 2;
  const rows = EXERCISE_GRID.rows;
  const rowHeight = (gridHeight - gutter * (rows - 1)) / rows;

  return {
    bandWidth,
    bandHeight,
    marginLeft: sw(EXERCISE_BAND.marginLeft),
    marginRight: sw(EXERCISE_BAND.marginRight),
    marginTop: sh(EXERCISE_BAND.marginTop),
    marginBottom: sh(EXERCISE_BAND.marginBottom),
    gridWidth,
    gridHeight,
    gridOffsetX,
    gridOffsetY,
    gutter,
    rowHeight,
    rows,
  };
}

/** Map target Hz to one of 6 pitch rows (0 = highest / top). */
export function hzToGridRow(
  hz: number,
  notes: ExerciseNote[],
  rows: number = EXERCISE_GRID.rows,
): number {
  const unique = [...new Set(notes.map((n) => n.targetHz))].sort((a, b) => a - b);
  if (unique.length === 0) return Math.floor(rows / 2);

  const index = unique.indexOf(hz);
  if (index < 0) {
    const min = unique[0];
    const max = unique[unique.length - 1];
    if (max === min) return Math.floor(rows / 2);
    const ratio = (hz - min) / (max - min);
    return Math.max(0, Math.min(rows - 1, Math.round((1 - ratio) * (rows - 1))));
  }

  if (unique.length === 1) return Math.floor(rows / 2);
  // Low Hz → bottom row (rows-1); high Hz → top row (0).
  const ratio = index / (unique.length - 1);
  return Math.max(0, Math.min(rows - 1, Math.round((1 - ratio) * (rows - 1))));
}

export function getExerciseNoteGridLayout(
  notes: ExerciseNote[],
  metrics: ExerciseBandMetrics,
): NoteGridCell[] {
  const n = notes.length;
  if (n === 0) return [];

  const { gridWidth, gutter, rowHeight, rows, gridOffsetX, gridOffsetY } = metrics;
  const totalDuration = notes.reduce((s, note) => s + Math.max(1, note.durationMs), 0);
  const availableWidth = gridWidth - gutter * (n - 1);

  let xCursor = gridOffsetX;
  return notes.map((note, column) => {
    const width = Math.max(
      1,
      availableWidth * (Math.max(1, note.durationMs) / totalDuration),
    );
    const row = hzToGridRow(note.targetHz, notes, rows);
    const y = gridOffsetY + row * (rowHeight + gutter);
    const cell: NoteGridCell = {
      note,
      x: xCursor,
      y,
      width,
      height: rowHeight,
      centerX: xCursor + width / 2,
      centerY: y + rowHeight / 2,
      row,
      column,
    };
    xCursor += width + gutter;
    return cell;
  });
}

/** X position of the playhead within the band for a given timeline time. */
export function timeToGridPlayheadX(
  timeMs: number,
  cells: NoteGridCell[],
): number {
  if (cells.length === 0) return 0;

  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    const start = cell.note.startMs;
    const end = start + cell.note.durationMs;
    const isLast = i === cells.length - 1;
    if (timeMs < end || isLast) {
      const progress = Math.max(
        0,
        Math.min(1, (timeMs - start) / Math.max(1, cell.note.durationMs)),
      );
      return cell.x + progress * cell.width;
    }
  }

  const last = cells[cells.length - 1];
  return last.x + last.width;
}

/** @deprecated Compatibility alias — prefer getExerciseBandMetrics. */
export type WarmupLaneMetrics = {
  laneHeight: number;
  noteHeight: number;
  noteWidth: number;
  noteGap: number;
  playheadX: number;
  pixelsPerMs: number;
  band: ExerciseBandMetrics;
};

/** @deprecated use getExerciseBandMetrics */
export const WARMUP_LANE_HEIGHT = 160;
/** @deprecated use getExerciseBandMetrics */
export const WARMUP_NOTE_HEIGHT = 32;
/** @deprecated use getExerciseBandMetrics */
export const WARMUP_NOTE_WIDTH = 100;
/** @deprecated use getExerciseBandMetrics */
export const WARMUP_NOTE_GAP = 20;
/** @deprecated use getExerciseBandMetrics */
export const WARMUP_PLAYHEAD_X = 72;
/** @deprecated use getExerciseBandMetrics */
export const WARMUP_PIXELS_PER_MS = 0.1;

export function getWarmupLaneMetrics(width: number, height: number): WarmupLaneMetrics {
  const band = getExerciseBandMetrics(width, height);
  return {
    laneHeight: band.bandHeight,
    noteHeight: band.rowHeight,
    noteWidth: band.gridWidth / 4,
    noteGap: band.gutter,
    playheadX: band.gridOffsetX,
    pixelsPerMs: band.gridWidth / 8000,
    band,
  };
}

export function warmupTimeToX(timeMs: number, pixelsPerMs: number): number {
  return timeMs * pixelsPerMs;
}
