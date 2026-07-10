import { StyleSheet, Text, View } from 'react-native';
import { ExerciseBackHeader } from '../components/ExerciseBackHeader';
import { PillActionButton } from '../components/PillActionButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { SessionMode } from '../types/exercise';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, exerciseTitleType, fontSizes } from '../theme/typography';
import { useResponsive } from '../theme/responsive';

type ExerciseMiniResultScreenProps = {
  exerciseIndex: number;
  totalExerciseCount: number;
  sessionMode: SessionMode;
  accuracyPercent: number;
  xpEarned: number;
  correctNotes: number;
  totalNotes: number;
  onContinue: () => void;
  onBack?: () => void;
};

export function ExerciseMiniResultScreen({
  exerciseIndex,
  totalExerciseCount,
  sessionMode,
  accuracyPercent,
  xpEarned,
  correctNotes,
  totalNotes,
  onContinue,
  onBack,
}: ExerciseMiniResultScreenProps) {
  const { isLandscape } = useResponsive();
  const isLast = exerciseIndex >= totalExerciseCount;
  const isWarmup = sessionMode === 'warmup';

  return (
    <ScreenLayout variant="dark" scrollable={false}>
      {onBack ? (
        <View style={styles.backRow}>
          <ExerciseBackHeader onConfirmBack={onBack} />
        </View>
      ) : null}
      <View style={[styles.card, isLandscape && styles.cardLandscape]}>
        <Text style={styles.badge}>
          Ejercicio {exerciseIndex} / {totalExerciseCount}
        </Text>
        <Text style={styles.title}>
          {isWarmup ? '¡Calentamiento en progreso!' : '¡Ejercicio completado!'}
        </Text>

        <View style={[styles.metricsRow, isLandscape && styles.metricsRowLandscape]}>
          <View style={styles.accuracyBlock}>
            <Text style={styles.accuracy}>{accuracyPercent}%</Text>
            <Text style={styles.accuracyLabel}>Precisión</Text>
          </View>

          <View style={[styles.statsRow, isLandscape && styles.statsRowLandscape]}>
            {!isWarmup && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>+ {xpEarned} XP</Text>
              </View>
            )}
            <View style={[styles.statBox, isWarmup && styles.statBoxFull]}>
              <Text style={styles.statValue}>
                {correctNotes} / {totalNotes}
              </Text>
              <Text style={styles.statHint}>notas logradas</Text>
            </View>
          </View>
        </View>

        <PillActionButton
          variant="continue"
          onPress={onContinue}
          accessibilityLabel={
            isLast
              ? isWarmup
                ? 'Finalizar calentamiento'
                : 'Ver resultados de lección'
              : 'Siguiente ejercicio'
          }
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  backRow: {
    marginBottom: spacing.sm,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardLandscape: {
    paddingVertical: spacing.md,
  },
  badge: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.title,
    fontSize: exerciseTitleType.fontSize,
    lineHeight: exerciseTitleType.lineHeight,
    letterSpacing: exerciseTitleType.letterSpacing,
    color: colors.light,
    textAlign: 'center',
  },
  metricsRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricsRowLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  accuracyBlock: {
    alignItems: 'center',
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
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statsRowLandscape: {
    flex: 1,
  },
  statBox: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statBoxFull: {
    flex: 1,
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.light,
    textAlign: 'center',
  },
  statHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
