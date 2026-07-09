import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { UserProgress } from '../audio/xpSystem';
import { colors } from '../theme/colors';
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
  const fillRatio = useSharedValue(
    progressBefore.xpInLevel / progressBefore.xpToNextLevel,
  );

  useEffect(() => {
    const target = progressAfter.xpInLevel / progressAfter.xpToNextLevel;
    if (animate) {
      fillRatio.value = withTiming(target, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      fillRatio.value = target;
    }
  }, [animate, fillRatio, progressAfter]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, fillRatio.value * 100)}%`,
  }));

  const earnedLeft = `${Math.min(92, (progressAfter.xpInLevel / progressAfter.xpToNextLevel) * 100 - 8)}%`;

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={styles.levelRow}>
        <Text style={[styles.levelNum, compact && styles.levelNumCompact]}>
          {progressBefore.level}
        </Text>
        <Text style={[styles.levelNum, compact && styles.levelNumCompact]}>
          {progressBefore.level + 1}
        </Text>
      </View>

      <View style={[styles.track, compact && styles.trackCompact]}>
        <Animated.View style={[styles.fill, fillStyle]} />
        {earnedXp > 0 && !compact && (
          <Text style={[styles.earnedLabel, { left: earnedLeft as `${number}%` }]}>
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
    color: colors.textPrimary,
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
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.pill,
  },
  earnedLabel: {
    position: 'absolute',
    top: -28,
    fontFamily: fonts.title,
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
});
