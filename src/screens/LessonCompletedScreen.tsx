import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserProgress } from '../audio/xpSystem';
import { ExperienceBar } from '../components/ExperienceBar';
import { PillActionButton } from '../components/PillActionButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { LESSON_EXERCISE_COUNT } from '../data/lessonExercises';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type LessonCompletedScreenProps = {
  totalXpEarned: number;
  totalCorrectNotes: number;
  totalNotes: number;
  progressBefore: UserProgress;
  progressAfter: UserProgress;
  onRepeat: () => void;
  onContinue: () => void;
};

export function LessonCompletedScreen({
  totalXpEarned,
  totalCorrectNotes,
  totalNotes,
  progressBefore,
  progressAfter,
  onRepeat,
  onContinue,
}: LessonCompletedScreenProps) {
  const headerXp = useMemo(() => progressAfter.totalXp, [progressAfter.totalXp]);

  return (
    <ScreenLayout variant="dark">
      <View style={styles.hero}>
        <Text style={styles.mascot}>🎵</Text>
        <Text style={styles.headerXp}>{headerXp}</Text>
      </View>

      <Text style={styles.title}>¡LECCIÓN COMPLETADA!</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>+ {totalXpEarned} XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {LESSON_EXERCISE_COUNT} / {LESSON_EXERCISE_COUNT}
          </Text>
          <Text style={styles.statHint}>ejercicios</Text>
        </View>
      </View>

      <Text style={styles.notesSummary}>
        Notas logradas: {totalCorrectNotes} / {totalNotes}
      </Text>

      <ExperienceBar
        progressBefore={progressBefore}
        progressAfter={progressAfter}
        earnedXp={totalXpEarned}
        animate
      />

      <View style={styles.footer}>
        <View style={styles.halfButton}>
          <PillActionButton
            variant="repeat"
            onPress={onRepeat}
            accessibilityLabel="Repetir"
          />
        </View>
        <View style={styles.halfButton}>
          <PillActionButton
            variant="continue"
            onPress={onContinue}
            accessibilityLabel="Continuar"
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  mascot: {
    fontSize: 40,
  },
  headerXp: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: colors.textPrimary,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  notesSummary: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  halfButton: {
    flex: 1,
  },
});
