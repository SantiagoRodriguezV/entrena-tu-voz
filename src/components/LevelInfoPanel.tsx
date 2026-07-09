import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Level } from '../types/exercise';
import { PillActionButton } from './PillActionButton';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type LevelInfoPanelProps = {
  level: Level;
  top: number;
  onContinue: () => void;
};

export function LevelInfoPanel({ level, top, onContinue }: LevelInfoPanelProps) {
  const canStart = Boolean(level.lessonId);
  const lessonLabel =
    level.lessonNumber && level.lessonNumber > 0
      ? `LECCIÓN ${level.lessonNumber}`
      : 'INTRO';

  return (
    <Pressable
      style={[styles.panel, { top }]}
      onPress={(e) => e.stopPropagation()}
    >
      <Text style={styles.lessonLabel}>{lessonLabel}</Text>
      <Text style={styles.title}>{level.title.toUpperCase()}</Text>
      <Text style={styles.description}>{level.description}</Text>

      <View style={styles.timeRow}>
        <Text style={styles.timeIcon}>⏱</Text>
        <Text style={styles.timeText}>{level.estimatedMinutes} min</Text>
      </View>

      {canStart ? (
        <PillActionButton
          variant="continue"
          onPress={onContinue}
          accessibilityLabel="Continuar"
        />
      ) : (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Próximamente</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: '#0D6E74',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    zIndex: 10,
  },
  lessonLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeIcon: {
    fontSize: fontSizes.lg,
  },
  timeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  comingSoon: {
    backgroundColor: colors.disabled,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  comingSoonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
});
