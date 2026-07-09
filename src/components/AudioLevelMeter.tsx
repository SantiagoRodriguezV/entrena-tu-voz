import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type AudioLevelMeterProps = {
  level: number;
  isSimulated?: boolean;
};

export function AudioLevelMeter({ level, isSimulated = false }: AudioLevelMeterProps) {
  const animatedLevel = useRef(new Animated.Value(level)).current;

  useEffect(() => {
    Animated.timing(animatedLevel, {
      toValue: Math.max(0, Math.min(1, level)),
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [level, animatedLevel]);

  const barWidth = animatedLevel.interpolate({
    inputRange: [0, 1],
    outputRange: ['5%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <View style={styles.micDot} />
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barWidth }]} />
        </View>
      </View>
      {isSimulated && (
        <View style={styles.simulatedBadge}>
          <View style={styles.simulatedDot} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  micDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.micActive,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.pill,
  },
  simulatedBadge: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  simulatedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
});
