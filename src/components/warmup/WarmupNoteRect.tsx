import { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { fonts, fontSizes } from '../../theme/typography';

type WarmupNoteRectProps = {
  vowelLabel: string;
  isIlluminated: boolean;
  width?: number;
  height?: number;
  style?: ViewStyle;
};

export function WarmupNoteRect({
  vowelLabel,
  isIlluminated,
  width = 100,
  height = 32,
  style,
}: WarmupNoteRectProps) {
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withTiming(isIlluminated ? 1 : 0, { duration: 300 });
  }, [isIlluminated, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.base}>
        <Text style={styles.vowel}>{vowelLabel}</Text>
      </View>
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  base: {
    flex: 1,
    backgroundColor: '#6B6B6B',
    borderRadius: 16,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  vowel: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xs,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
});
