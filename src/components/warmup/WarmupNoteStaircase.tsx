import { ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { getMinMaxHz, hzToY } from '../../audio/pitchUtils';
import { ExerciseNote } from '../../types/exercise';
import { colors } from '../../theme/colors';
import { WarmupNoteRect } from './WarmupNoteRect';

export const WARMUP_LANE_HEIGHT = 160;
export const WARMUP_NOTE_HEIGHT = 32;
export const WARMUP_NOTE_WIDTH = 100;
export const WARMUP_NOTE_GAP = 20;
export const WARMUP_PLAYHEAD_X = 72;
export const WARMUP_PIXELS_PER_MS = 0.1;

type WarmupNoteStaircaseProps = {
  notes: ExerciseNote[];
  vowelLabel: string;
  mode: 'static' | 'scrolling';
  activeNoteId?: string | null;
  illuminatedNoteId?: string | null;
  timeMs?: number;
  overlay?: ReactNode;
};

export function warmupTimeToX(timeMs: number): number {
  return timeMs * WARMUP_PIXELS_PER_MS;
}

function getStaticPositions(
  notes: ExerciseNote[],
  minHz: number,
  maxHz: number,
) {
  return notes.map((note, index) => {
    const x = index * (WARMUP_NOTE_WIDTH + WARMUP_NOTE_GAP) + 24;
    const centerY = hzToY(note.targetHz, minHz, maxHz, WARMUP_LANE_HEIGHT);
    const y = centerY - WARMUP_NOTE_HEIGHT / 2;
    return { note, x, y };
  });
}

function getScrollLayout(note: ExerciseNote, minHz: number, maxHz: number) {
  const x = warmupTimeToX(note.startMs);
  const width = Math.max(WARMUP_NOTE_WIDTH, note.durationMs * WARMUP_PIXELS_PER_MS);
  const centerY = hzToY(note.targetHz, minHz, maxHz, WARMUP_LANE_HEIGHT);
  const y = centerY - WARMUP_NOTE_HEIGHT / 2;
  return { x, y, width, centerY };
}

export function getWarmupScrollLayout(
  note: ExerciseNote,
  minHz: number,
  maxHz: number,
) {
  return getScrollLayout(note, minHz, maxHz);
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
  const { minHz, maxHz } = useMemo(() => getMinMaxHz(notes), [notes]);

  if (mode === 'static') {
    const positions = getStaticPositions(notes, minHz, maxHz);
    const contentWidth =
      positions.length > 0
        ? positions[positions.length - 1].x + WARMUP_NOTE_WIDTH + 24
        : 200;

    return (
      <View style={styles.staticContainer}>
        <View style={[styles.centerLine, { width: contentWidth }]} />
        <View style={[styles.notesLayer, { width: contentWidth, height: WARMUP_LANE_HEIGHT }]}>
          {positions.map(({ note, x, y }) => (
            <WarmupNoteRect
              key={note.id}
              vowelLabel={vowelLabel}
              isIlluminated={illuminatedNoteId === note.id}
              width={WARMUP_NOTE_WIDTH}
              height={WARMUP_NOTE_HEIGHT}
              style={{ position: 'absolute', left: x, top: y }}
            />
          ))}
        </View>
      </View>
    );
  }

  const lastNote = notes[notes.length - 1];
  const totalWidth = lastNote
    ? warmupTimeToX(lastNote.startMs + lastNote.durationMs) + 40
    : 200;
  const scrollOffset = warmupTimeToX(timeMs) - WARMUP_PLAYHEAD_X;

  return (
    <View style={styles.scrollContainer}>
      <View style={styles.laneFrame}>
        <View
          style={[
            styles.scrollContent,
            {
              width: totalWidth,
              height: WARMUP_LANE_HEIGHT,
              transform: [{ translateX: -scrollOffset }],
            },
          ]}
        >
          <View style={[styles.centerLine, { width: totalWidth }]} />
          {notes.map((note) => {
            const { x, y, width } = getScrollLayout(note, minHz, maxHz);
            return (
              <WarmupNoteRect
                key={note.id}
                vowelLabel={vowelLabel}
                isIlluminated={activeNoteId === note.id}
                width={width}
                height={WARMUP_NOTE_HEIGHT}
                style={{ position: 'absolute', left: x, top: y }}
              />
            );
          })}
        </View>

        <View style={styles.playhead}>
          <View style={styles.playheadSquare} />
        </View>
        <View style={styles.playheadDot} />
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
    height: WARMUP_LANE_HEIGHT,
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
    top: WARMUP_LANE_HEIGHT / 2,
    height: 1,
    backgroundColor: '#555555',
  },
  notesLayer: {
    position: 'relative',
  },
  playhead: {
    position: 'absolute',
    left: WARMUP_PLAYHEAD_X,
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
    left: WARMUP_PLAYHEAD_X - 6,
    top: WARMUP_LANE_HEIGHT / 2 - 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F1F1F',
  },
});
