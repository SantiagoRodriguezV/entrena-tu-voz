import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { UserProgress } from '../audio/xpSystem';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={RING_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedRingProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
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
    color: colors.textPrimary,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
