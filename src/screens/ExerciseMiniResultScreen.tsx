import { StyleSheet, Text, View } from 'react-native';
import { PillActionButton } from '../components/PillActionButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { LESSON_EXERCISE_COUNT } from '../data/lessonExercises';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type ExerciseMiniResultScreenProps = {
  exerciseIndex: number;
  accuracyPercent: number;
  xpEarned: number;
  correctNotes: number;
  totalNotes: number;
  onContinue: () => void;
};

export function ExerciseMiniResultScreen({
  exerciseIndex,
  accuracyPercent,
  xpEarned,
  correctNotes,
  totalNotes,
  onContinue,
}: ExerciseMiniResultScreenProps) {
  const isLast = exerciseIndex >= LESSON_EXERCISE_COUNT;

  return (
    <ScreenLayout variant="dark">
      <View style={styles.card}>
        <Text style={styles.badge}>
          Ejercicio {exerciseIndex} / {LESSON_EXERCISE_COUNT}
        </Text>
        <Text style={styles.title}>¡Ejercicio completado!</Text>

        <Text style={styles.accuracy}>{accuracyPercent}%</Text>
        <Text style={styles.accuracyLabel}>Precisión</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>+ {xpEarned} XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {correctNotes} / {totalNotes}
            </Text>
            <Text style={styles.statHint}>notas logradas</Text>
          </View>
        </View>

        <PillActionButton
          variant="continue"
          onPress={onContinue}
          accessibilityLabel={
            isLast ? 'Ver resultados de lección' : 'Siguiente ejercicio'
          }
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  badge: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  accuracy: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: colors.secondary,
    textAlign: 'center',
  },
  accuracyLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
