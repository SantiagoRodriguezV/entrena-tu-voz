import { StyleSheet, Text, View } from 'react-native';
import { aggregateExerciseScore, getFeedbackMessage } from '../audio/exerciseScoring';
import { getScenarioLabel } from '../audio/DemoVocalEngine';
import { exerciseNotes } from '../data/exerciseNotes';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { DemoScenario, NotePerformance } from '../types/exercise';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type ExerciseResultsScreenProps = {
  performances: NotePerformance[];
  scenario: DemoScenario;
  onGoHome: () => void;
};

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ExerciseResultsScreen({
  performances,
  scenario,
  onGoHome,
}: ExerciseResultsScreenProps) {
  const overallScore = aggregateExerciseScore(performances);
  const feedback = getFeedbackMessage(overallScore, getScenarioLabel(scenario));

  return (
    <ScreenLayout>
      <Text style={styles.title}>Resultados</Text>
      <Text style={styles.overallScore}>{formatPercent(overallScore)}</Text>

      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>{feedback.title}</Text>
        <Text style={styles.feedbackBody}>{feedback.body}</Text>
      </View>

      <View style={styles.notesSection}>
        <Text style={styles.sectionLabel}>Por nota</Text>
        {performances.map((perf) => {
          const note = exerciseNotes.find((n) => n.id === perf.noteId);
          return (
            <View key={perf.noteId} style={styles.noteCard}>
              <Text style={styles.noteTitle}>{note?.label ?? perf.noteId}</Text>
              <View style={styles.scoreRow}>
                <ScoreChip label="Altura" value={perf.pitchScore} />
                <ScoreChip label="Volumen" value={perf.volumeScore} />
                <ScoreChip label="Duración" value={perf.durationScore} />
              </View>
              <Text style={styles.finalScore}>
                Total: {formatPercent(perf.finalScore)}
              </Text>
            </View>
          );
        })}
      </View>

      <PrimaryButton label="Volver al mapa" onPress={onGoHome} />
    </ScreenLayout>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{formatPercent(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  overallScore: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  feedbackCard: {
    backgroundColor: colors.secondary + '22',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  feedbackTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  feedbackBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textDark,
    lineHeight: 22,
    opacity: 0.85,
  },
  notesSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textDark,
  },
  noteCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  noteTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.md,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  chipLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  chipValue: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textDark,
  },
  finalScore: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.secondaryDark,
    fontWeight: '600',
  },
});
