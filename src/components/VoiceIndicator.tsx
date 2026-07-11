import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import IndicadorDeVoz from '../../assets/icons/indicador-de-voz.svg';

type TrailPoint = { x: number; y: number; id: number };

type VoiceIndicatorProps = {
  size: number;
  /** Kept for API compatibility; SVG uses its own fill. */
  color?: string;
  animatedX: SharedValue<number>;
  animatedY: SharedValue<number>;
  animatedOpacity: SharedValue<number>;
};

const TRAIL_MAX = 12;
const MOVE_THRESHOLD_SQ = 2.5 * 2.5;

export function VoiceIndicator({
  size,
  animatedX,
  animatedY,
  animatedOpacity,
}: VoiceIndicatorProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const nextIdRef = useRef(0);

  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  const pushTrail = useCallback((x: number, y: number) => {
    nextIdRef.current += 1;
    const id = nextIdRef.current;
    setTrail((prev) => {
      const next = [...prev, { x, y, id }];
      return next.length > TRAIL_MAX ? next.slice(next.length - TRAIL_MAX) : next;
    });
  }, []);

  useAnimatedReaction(
    () => ({
      x: animatedX.value,
      y: animatedY.value,
      opacity: animatedOpacity.value,
    }),
    (current, previous) => {
      if (current.opacity < 0.35) {
        runOnJS(clearTrail)();
        return;
      }
      if (!previous) {
        runOnJS(pushTrail)(current.x, current.y);
        return;
      }
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      if (dx * dx + dy * dy >= MOVE_THRESHOLD_SQ) {
        runOnJS(pushTrail)(current.x, current.y);
      }
    },
    [clearTrail, pushTrail],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    left: animatedX.value - size / 2,
    top: animatedY.value - size / 2,
    opacity: animatedOpacity.value,
  }));

  return (
    <View style={styles.layer} pointerEvents="none">
      {trail.map((point, index) => {
        const age = trail.length <= 1 ? 1 : index / (trail.length - 1);
        const dotSize = size * (0.25 + age * 0.45);
        const opacity = 0.12 + age * 0.45;
        return (
          <View
            key={point.id}
            style={[
              styles.trailDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                left: point.x - dotSize / 2,
                top: point.y - dotSize / 2,
                opacity,
                backgroundColor: colors.light,
              },
            ]}
          />
        );
      })}

      <Animated.View style={[styles.indicator, { width: size, height: size }, indicatorStyle]}>
        <IndicadorDeVoz width={size} height={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
  },
  trailDot: {
    position: 'absolute',
  },
  indicator: {
    position: 'absolute',
  },
});
