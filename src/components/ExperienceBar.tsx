import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { UserProgress } from '../audio/xpSystem';
import { colors, palette } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type ExperienceBarProps = {
  progressBefore: UserProgress;
  progressAfter: UserProgress;
  earnedXp: number;
  animate?: boolean;
  compact?: boolean;
};

export function ExperienceBar({
  progressBefore,
  progressAfter,
  earnedXp,
  animate = true,
  compact = false,
}: ExperienceBarProps) {
  const beforeRatio = progressBefore.xpInLevel / progressBefore.xpToNextLevel;
  const afterRatio = progressAfter.xpInLevel / progressAfter.xpToNextLevel;
  const leveledUp = progressAfter.level > progressBefore.level;

  const priorWidth = useSharedValue(beforeRatio);
  const earnedWidth = useSharedValue(
    leveledUp ? afterRatio : Math.max(0, afterRatio - beforeRatio),
  );

  useEffect(() => {
    if (!animate) {
      priorWidth.value = leveledUp ? 0 : beforeRatio;
      earnedWidth.value = leveledUp
        ? afterRatio
        : Math.max(0, afterRatio - beforeRatio);
      return;
    }

    if (leveledUp) {
      priorWidth.value = beforeRatio;
      earnedWidth.value = 0;
      priorWidth.value = withSequence(
        withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 }),
      );
      earnedWidth.value = withTiming(afterRatio, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    priorWidth.value = beforeRatio;
    earnedWidth.value = withTiming(Math.max(0, afterRatio - beforeRatio), {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [
    afterRatio,
    animate,
    beforeRatio,
    earnedWidth,
    leveledUp,
    priorWidth,
  ]);

  const priorStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, priorWidth.value * 100)}%`,
  }));

  const earnedStyle = useAnimatedStyle(() => ({
    left: `${Math.min(100, priorWidth.value * 100)}%`,
    width: `${Math.min(100 - priorWidth.value * 100, earnedWidth.value * 100)}%`,
  }));

  const earnedLabelLeft = leveledUp
    ? `${Math.min(92, afterRatio * 100 - 8)}%`
    : `${Math.min(92, (beforeRatio + Math.max(0, afterRatio - beforeRatio) / 2) * 100)}%`;

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={styles.levelRow}>
        <Text style={[styles.levelNum, compact && styles.levelNumCompact]}>
          {progressBefore.level}
        </Text>
        <Text style={[styles.levelNum, compact && styles.levelNumCompact]}>
          {progressAfter.level}
        </Text>
      </View>

      <View style={[styles.track, compact && styles.trackCompact]}>
        <Animated.View style={[styles.priorFill, priorStyle]} />
        <Animated.View style={[styles.earnedFill, earnedStyle]} />
        {earnedXp > 0 && !compact && (
          <Text style={[styles.earnedLabel, { left: earnedLabelLeft as `${number}%` }]}>
            + {earnedXp} XP
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.sm,
  },
  wrapperCompact: {
    gap: 4,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  levelNum: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: colors.light,
  },
  levelNumCompact: {
    fontSize: fontSizes.lg,
  },
  track: {
    height: 28,
    backgroundColor: colors.border,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  trackCompact: {
    height: 10,
  },
  priorFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: palette.turqShadeMain,
    borderRadius: borderRadius.pill,
  },
  earnedFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: palette.turqLightMain,
    borderRadius: borderRadius.pill,
  },
  earnedLabel: {
    position: 'absolute',
    top: -28,
    fontFamily: fonts.title,
    fontSize: fontSizes.md,
    color: palette.turqLightMain,
  },
});
