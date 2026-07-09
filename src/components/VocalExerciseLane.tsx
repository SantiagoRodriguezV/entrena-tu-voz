import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { getMinMaxHz, hzToY } from '../audio/pitchUtils';
import { ExerciseNote } from '../types/exercise';
import { NoteBlock, NotePaintSegment } from './NoteBlock';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

export const PIXELS_PER_MS = 0.09;
export const LANE_HEIGHT = 200;
export const NOTE_BLOCK_HEIGHT = 36;
export const PLAYHEAD_X = 72;

type VocalExerciseLaneProps = {
  timeMs: number;
  notePaintMap: Record<string, NotePaintSegment[]>;
  activeNoteId: string | null;
  notes: ExerciseNote[];
};

export function timeToX(timeMs: number): number {
  return timeMs * PIXELS_PER_MS;
}

export function getNoteLayout(note: ExerciseNote, minHz: number, maxHz: number) {
  const x = timeToX(note.startMs);
  const width = note.durationMs * PIXELS_PER_MS;
  const centerY = hzToY(note.targetHz, minHz, maxHz, LANE_HEIGHT);
  const y = centerY - NOTE_BLOCK_HEIGHT / 2;
  return { x, y, width };
}

export function VocalExerciseLane({
  timeMs,
  notePaintMap,
  activeNoteId,
  notes,
}: VocalExerciseLaneProps) {
  const { minHz, maxHz } = useMemo(() => getMinMaxHz(notes), [notes]);
  const lastNote = notes[notes.length - 1];
  const totalWidth = lastNote
    ? timeToX(lastNote.startMs + lastNote.durationMs) + 40
    : 200;
  const scrollOffset = timeToX(timeMs) - PLAYHEAD_X;

  return (
    <View style={styles.container}>
      <View style={styles.laneClip}>
        <Svg
          width={totalWidth}
          height={LANE_HEIGHT}
          style={{ transform: [{ translateX: -scrollOffset }] }}
        >
          <Line
            x1={0}
            y1={LANE_HEIGHT / 2}
            x2={totalWidth}
            y2={LANE_HEIGHT / 2}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="6 4"
          />
          {notes.map((note) => {
            const { x, y, width } = getNoteLayout(note, minHz, maxHz);
            return (
              <NoteBlock
                key={note.id}
                note={note}
                x={x}
                y={y}
                width={width}
                height={NOTE_BLOCK_HEIGHT}
                paintSegments={notePaintMap[note.id] ?? []}
                isActive={note.id === activeNoteId}
              />
            );
          })}
        </Svg>

        <View style={[styles.playhead, { left: PLAYHEAD_X }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  laneClip: {
    flex: 1,
    minHeight: LANE_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
});
