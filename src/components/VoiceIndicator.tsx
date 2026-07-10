import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

type VoiceIndicatorProps = {
  size: number;
  color: string;
  animatedX: SharedValue<number>;
  animatedY: SharedValue<number>;
  animatedOpacity: SharedValue<number>;
};

export function VoiceIndicator({
  size,
  color,
  animatedX,
  animatedY,
  animatedOpacity,
}: VoiceIndicatorProps) {
  const positionStyle = useAnimatedStyle(() => ({
    left: animatedX.value - size / 2,
    top: animatedY.value - size / 2,
    opacity: animatedOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: color,
          borderWidth: 2,
          borderColor: colors.light,
        },
        positionStyle,
      ]}
    />
  );
}
