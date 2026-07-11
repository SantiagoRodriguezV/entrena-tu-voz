import { ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ExerciseNote } from '../../types/exercise';
import { colors } from '../../theme/colors';
import { useResponsive } from '../../theme/responsive';
import {
  getExerciseBandMetrics,
  getExerciseNoteGridLayout,
  timeToGridPlayheadX,
  type ExerciseBandMetrics,
  type NoteGridCell,
} from '../../theme/warmupLaneMetrics';
import { WarmupNoteRect } from './WarmupNoteRect';

export {
  getWarmupLaneMetrics,
  getExerciseBandMetrics,
  getExerciseNoteGridLayout,
  timeToGridPlayheadX,
  warmupTimeToX,
  WARMUP_LANE_HEIGHT,
  WARMUP_NOTE_HEIGHT,
  WARMUP_NOTE_WIDTH,
  WARMUP_NOTE_GAP,
  WARMUP_PLAYHEAD_X,
  WARMUP_PIXELS_PER_MS,
} from '../../theme/warmupLaneMetrics';

export type { NoteGridCell, ExerciseBandMetrics };

type WarmupNoteStaircaseProps = {
  notes: ExerciseNote[];
  vowelLabel: string;
  mode: 'static' | 'scrolling';
  activeNoteId?: string | null;
  illuminatedNoteId?: string | null;
  /** Color for the active note glow based on live pitch accuracy. */
  activeNoteColor?: string | null;
  timeMs?: number;
  overlay?: ReactNode;
};

/** @deprecated Prefer getExerciseNoteGridLayout — kept for call-site compatibility. */
export function getWarmupScrollLayout(
  note: ExerciseNote,
  _minHz: number,
  _maxHz: number,
  metrics?: ReturnType<typeof getExerciseBandMetrics>,
) {
  const band = metrics ?? getExerciseBandMetrics(1055, 412);
  const cells = getExerciseNoteGridLayout([note], band);
  const cell = cells[0];
  return {
    x: cell?.x ?? band.gridOffsetX,
    y: cell?.y ?? band.gridOffsetY,
    width: cell?.width ?? band.gridWidth,
    centerY: cell?.centerY ?? band.bandHeight / 2,
  };
}

export function WarmupNoteStaircase({
  notes,
  vowelLabel,
  mode,
  activeNoteId = null,
  illuminatedNoteId = null,
  activeNoteColor = null,
  timeMs = 0,
  overlay,
}: WarmupNoteStaircaseProps) {
  const { width, height } = useResponsive();
  const band = useMemo(
    () => getExerciseBandMetrics(width, height),
    [width, height],
  );
  const cells = useMemo(
    () => getExerciseNoteGridLayout(notes, band),
    [notes, band],
  );

  const highlightId = mode === 'static' ? illuminatedNoteId : activeNoteId;
  const playheadX =
    mode === 'scrolling' ? timeToGridPlayheadX(timeMs, cells) : null;

  return (
    <View style={[styles.bandFrame, { width: band.bandWidth, height: band.bandHeight }]}>
      <View
        style={[
          styles.gridLayer,
          { width: band.bandWidth, height: band.bandHeight },
        ]}
      >
        {cells.map((cell) => {
          const isActive = highlightId === cell.note.id;
          return (
            <WarmupNoteRect
              key={cell.note.id}
              vowelLabel={vowelLabel}
              isIlluminated={isActive}
              accuracyColor={isActive ? activeNoteColor : null}
              width={cell.width}
              height={cell.height}
              style={{ position: 'absolute', left: cell.x, top: cell.y }}
            />
          );
        })}
      </View>

      {playheadX !== null ? (
        <>
          <View style={[styles.playhead, { left: playheadX }]}>
            <View style={styles.playheadSquare} />
          </View>
          <View
            style={[
              styles.playheadDot,
              {
                left: playheadX - 6,
                top: band.bandHeight / 2 - 6,
              },
            ]}
          />
        </>
      ) : null}

      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  bandFrame: {
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  gridLayer: {
    position: 'relative',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playheadSquare: {
    width: 8,
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 1,
  },
  playheadDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.light,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
