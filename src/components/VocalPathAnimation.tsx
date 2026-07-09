import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type VocalPathAnimationProps = {
  progress: number;
  width?: number;
  height?: number;
  showDot?: boolean;
};

function getPointOnCurve(t: number, width: number, height: number) {
  const x = t * width;
  const y = height - t * height * 0.85 - Math.sin(t * Math.PI) * height * 0.15;
  return { x, y };
}

export function VocalPathAnimation({
  progress,
  width = 280,
  height = 140,
  showDot = true,
}: VocalPathAnimationProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const segments = 24;
  const dot = getPointOnCurve(clampedProgress, width, height);

  return (
    <View style={[styles.container, { width, height }]}>
      {Array.from({ length: segments }).map((_, index) => {
        const t = index / segments;
        const point = getPointOnCurve(t, width, height);
        const isPassed = t <= clampedProgress;
        return (
          <View
            key={index}
            style={[
              styles.pathDot,
              {
                left: point.x - 3,
                top: point.y - 3,
                backgroundColor: isPassed ? colors.secondary : colors.border,
              },
            ]}
          />
        );
      })}
      {showDot && (
        <View
          style={[
            styles.movingDot,
            { left: dot.x - 8, top: dot.y - 8 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  pathDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  movingDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
