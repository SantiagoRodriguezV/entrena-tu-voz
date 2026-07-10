import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { UserProgress } from '../audio/xpSystem';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

const AnimatedCircle =
  Platform.OS === 'web' ? Circle : Animated.createAnimatedComponent(Circle);

type LevelXpBadgeProps = {
  progress: UserProgress;
  size?: number;
  animate?: boolean;
};

const RING_COLOR = '#22BAA6';
const TRACK_COLOR = '#3A3A3A';

export function LevelXpBadge({ progress, size = 44, animate = false }: LevelXpBadgeProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const targetRatio = progress.xpInLevel / progress.xpToNextLevel;
  const fillRatio = useSharedValue(targetRatio);

  useEffect(() => {
    if (animate) {
      fillRatio.value = withTiming(targetRatio, { duration: 800 });
    } else {
      fillRatio.value = targetRatio;
    }
  }, [animate, fillRatio, targetRatio]);

  const animatedRingProps = useAnimatedProps(() => {
    const offset = circumference * (1 - fillRatio.value);
    return {
      strokeDashoffset: offset,
    };
  });

  const ringProps = {
    cx: center,
    cy: center,
    r: radius,
    stroke: RING_COLOR,
    strokeWidth: strokeWidth,
    fill: 'none' as const,
    strokeDasharray: `${circumference} ${circumference}`,
    strokeLinecap: 'round' as const,
    rotation: -90,
    origin: `${center}, ${center}`,
  };

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {Platform.OS === 'web' ? (
          <Circle
            {...ringProps}
            strokeDashoffset={circumference * (1 - targetRatio)}
          />
        ) : (
          <AnimatedCircle {...ringProps} animatedProps={animatedRingProps} />
        )}
      </Svg>
      <Text style={[styles.levelText, { fontSize: size * 0.38 }]}>{progress.level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  levelText: {
    fontFamily: fonts.title,
    color: colors.light,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
