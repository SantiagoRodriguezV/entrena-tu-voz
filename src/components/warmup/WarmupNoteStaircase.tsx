import { ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { getMinMaxHz, hzToY } from '../../audio/pitchUtils';
import { ExerciseNote } from '../../types/exercise';
import { colors } from '../../theme/colors';
import { useResponsive } from '../../theme/responsive';
import {
  getWarmupLaneMetrics,
  warmupTimeToX,
  type WarmupLaneMetrics,
} from '../../theme/warmupLaneMetrics';
import { WarmupNoteRect } from './WarmupNoteRect';

export {
  getWarmupLaneMetrics,
  warmupTimeToX,
  WARMUP_LANE_HEIGHT,
  WARMUP_NOTE_HEIGHT,
  WARMUP_NOTE_WIDTH,
  WARMUP_NOTE_GAP,
  WARMUP_PLAYHEAD_X,
  WARMUP_PIXELS_PER_MS,
} from '../../theme/warmupLaneMetrics';

type WarmupNoteStaircaseProps = {
  notes: ExerciseNote[];
  vowelLabel: string;
  mode: 'static' | 'scrolling';
  activeNoteId?: string | null;
  illuminatedNoteId?: string | null;
  timeMs?: number;
  overlay?: ReactNode;
};

function getStaticPositions(
  notes: ExerciseNote[],
  minHz: number,
  maxHz: number,
  metrics: WarmupLaneMetrics,
) {
  return notes.map((note, index) => {
    const x = index * (metrics.noteWidth + metrics.noteGap) + 24;
    const centerY = hzToY(note.targetHz, minHz, maxHz, metrics.laneHeight);
    const y = centerY - metrics.noteHeight / 2;
    return { note, x, y };
  });
}

function getScrollLayout(
  note: ExerciseNote,
  minHz: number,
  maxHz: number,
  metrics: WarmupLaneMetrics,
) {
  const x = warmupTimeToX(note.startMs, metrics.pixelsPerMs);
  const width = Math.max(
    metrics.noteWidth,
    note.durationMs * metrics.pixelsPerMs,
  );
  const centerY = hzToY(note.targetHz, minHz, maxHz, metrics.laneHeight);
  const y = centerY - metrics.noteHeight / 2;
  return { x, y, width, centerY };
}

export function getWarmupScrollLayout(
  note: ExerciseNote,
  minHz: number,
  maxHz: number,
  metrics?: WarmupLaneMetrics,
) {
  const fallback = getWarmupLaneMetrics(412, 891);
  return getScrollLayout(note, minHz, maxHz, metrics ?? fallback);
}

export function WarmupNoteStaircase({
  notes,
  vowelLabel,
  mode,
  activeNoteId = null,
  illuminatedNoteId = null,
  timeMs = 0,
  overlay,
}: WarmupNoteStaircaseProps) {
  const { width, height } = useResponsive();
  const metrics = useMemo(
    () => getWarmupLaneMetrics(width, height),
    [width, height],
  );
  const { minHz, maxHz } = useMemo(() => getMinMaxHz(notes), [notes]);

  if (mode === 'static') {
    const positions = getStaticPositions(notes, minHz, maxHz, metrics);
    const contentWidth =
      positions.length > 0
        ? positions[positions.length - 1].x + metrics.noteWidth + 24
        : 200;

    return (
      <View style={styles.staticContainer}>
        <View
          style={[
            styles.centerLine,
            { width: contentWidth, top: metrics.laneHeight / 2 },
          ]}
        />
        <View
          style={[
            styles.notesLayer,
            { width: contentWidth, height: metrics.laneHeight },
          ]}
        >
          {positions.map(({ note, x, y }) => (
            <WarmupNoteRect
              key={note.id}
              vowelLabel={vowelLabel}
              isIlluminated={illuminatedNoteId === note.id}
              width={metrics.noteWidth}
              height={metrics.noteHeight}
              style={{ position: 'absolute', left: x, top: y }}
            />
          ))}
        </View>
      </View>
    );
  }

  const lastNote = notes[notes.length - 1];
  const totalWidth = lastNote
    ? warmupTimeToX(lastNote.startMs + lastNote.durationMs, metrics.pixelsPerMs) + 40
    : 200;
  const scrollOffset =
    warmupTimeToX(timeMs, metrics.pixelsPerMs) - metrics.playheadX;

  return (
    <View style={styles.scrollContainer}>
      <View style={[styles.laneFrame, { height: metrics.laneHeight }]}>
        <View
          style={[
            styles.scrollContent,
            {
              width: totalWidth,
              height: metrics.laneHeight,
              transform: [{ translateX: -scrollOffset }],
            },
          ]}
        >
          <View
            style={[
              styles.centerLine,
              { width: totalWidth, top: metrics.laneHeight / 2 },
            ]}
          />
          {notes.map((note) => {
            const { x, y, width: noteW } = getScrollLayout(
              note,
              minHz,
              maxHz,
              metrics,
            );
            return (
              <WarmupNoteRect
                key={note.id}
                vowelLabel={vowelLabel}
                isIlluminated={activeNoteId === note.id}
                width={noteW}
                height={metrics.noteHeight}
                style={{ position: 'absolute', left: x, top: y }}
              />
            );
          })}
        </View>

        <View style={[styles.playhead, { left: metrics.playheadX }]}>
          <View style={styles.playheadSquare} />
        </View>
        <View
          style={[
            styles.playheadDot,
            {
              left: metrics.playheadX - 6,
              top: metrics.laneHeight / 2 - 6,
            },
          ]}
        />
        {overlay}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  staticContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  laneFrame: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollContent: {
    position: 'relative',
  },
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#555555',
  },
  notesLayer: {
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
    borderColor: '#1F1F1F',
  },
});
