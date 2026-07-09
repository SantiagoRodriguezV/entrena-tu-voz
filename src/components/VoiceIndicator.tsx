import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

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
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: animatedX.value - size / 2,
    top: animatedY.value - size / 2,
    width: size,
    height: size,
    borderRadius: size * 0.3,
    backgroundColor: color,
    opacity: animatedOpacity.value,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  }));

  return <Animated.View style={style} />;
}
