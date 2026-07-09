import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ExerciseTimeProgressProps = {
  progress: number;
  noteCount?: number;
};

export function ExerciseTimeProgress({
  progress,
  noteCount = 8,
}: ExerciseTimeProgressProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.wrapper} accessibilityRole="progressbar">
      <View style={styles.notesRow}>
        {Array.from({ length: noteCount }).map((_, index) => {
          const noteProgress = (index + 0.5) / noteCount;
          const lineReached = clamped >= noteProgress;
          return (
            <View key={index} style={styles.noteColumn}>
              {lineReached && <View style={styles.progressLine} />}
              <View style={[styles.note, lineReached && styles.noteActive]} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: spacing.md,
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 48,
  },
  noteColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    height: '100%',
  },
  progressLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '70%',
    backgroundColor: colors.secondary,
    opacity: 0.8,
    borderRadius: 1,
  },
  note: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  noteActive: {
    backgroundColor: colors.secondary,
  },
});
