import { Pressable, StyleSheet, Text, View } from 'react-native';
import RockHandTurq from '../../assets/icons/rock-hand-turq.svg';
import { estimateLessonTotalXp } from '../audio/xpSystem';
import { LESSON_EXERCISE_COUNT } from '../data/lessonExercises';
import { Level, NodeLayoutMetrics } from '../types/exercise';
import { AppIcon } from './AppIcon';
import { PillActionButton } from './PillActionButton';
import { colors, getLevelAccent, withOpacity } from '../theme/colors';
import { borderRadius, PANEL_ANCHOR_GAP, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';
import { useResponsive } from '../theme/responsive';

export const PANEL_WIDTH_BASE = 260;

type LevelInfoPanelProps = {
  level: Level;
  anchor: NodeLayoutMetrics;
  mapWidth: number;
  onContinue: () => void;
  embedded?: boolean;
};

export function LevelInfoPanel({
  level,
  anchor,
  mapWidth,
  onContinue,
  embedded = false,
}: LevelInfoPanelProps) {
  const { moderateScale } = useResponsive();
  const panelWidth = moderateScale(PANEL_WIDTH_BASE);
  const accent = getLevelAccent(level.category);
  const isLocked = level.status === 'locked';
  const canStart = !isLocked && Boolean(level.lessonId);
  const estimatedXp = estimateLessonTotalXp(LESSON_EXERCISE_COUNT);
  const top = anchor.bottom + PANEL_ANCHOR_GAP;
  const left = Math.max(
    spacing.sm,
    Math.min(anchor.cx - panelWidth / 2, mapWidth - panelWidth - spacing.sm),
  );

  const renderAction = () => {
    if (isLocked) {
      return <PillActionButton variant="locked" />;
    }
    if (canStart) {
      return (
        <PillActionButton
          variant="continue"
          onPress={onContinue}
          accessibilityLabel="Continuar"
        />
      );
    }
    return (
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>Próximamente</Text>
      </View>
    );
  };

  return (
    <Pressable
      style={[
        styles.panel,
        embedded && styles.panelEmbedded,
        { top, left, width: panelWidth, borderColor: accent.border },
      ]}
      onPress={(e) => e.stopPropagation()}
    >
      <Text style={[styles.sectionTitle, { color: accent.accent }]}>{level.displayCode}</Text>
      <Text style={styles.title}>{level.title}</Text>
      <Text style={styles.description}>{level.description}</Text>

      <View style={styles.metaRow}>
        <AppIcon icon={RockHandTurq} size={22} />
        <Text style={styles.metaText}>+ {estimatedXp} XP al completar</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.timeIcon, { color: accent.accent }]}>⏱</Text>
        <Text style={styles.timeText}>{level.estimatedMinutes} min</Text>
      </View>

      {renderAction()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    backgroundColor: withOpacity(colors.surface, 0.85),
    borderWidth: 3,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    zIndex: 30,
    elevation: 30,
  },
  panelEmbedded: {
    zIndex: 12,
    elevation: 12,
  },
  sectionTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
    textAlign: 'left',
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.md,
    color: colors.light,
    marginBottom: spacing.sm,
    lineHeight: 22,
    textAlign: 'left',
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.light,
    textAlign: 'left',
  },
  timeIcon: {
    fontSize: fontSizes.xl,
    lineHeight: 28,
  },
  timeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.light,
    textAlign: 'left',
  },
  comingSoon: {
    backgroundColor: colors.disabled,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  comingSoonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
});
