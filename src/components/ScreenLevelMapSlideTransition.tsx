import { ReactNode, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { palette } from '../theme/colors';
import { useResponsive } from '../theme/responsive';

const SLIDE_DURATION_MS = 380;

export type NavDirection = 'forward' | 'back';
export type SlideMode = 'enter' | 'exit';

type ScreenLevelMapSlideTransitionProps = {
  screenKey: string;
  direction?: NavDirection;
  mode?: SlideMode;
  onExitComplete?: () => void;
  children: ReactNode;
};

/** Duolingo-style level map slide: forward enters from right, back exits to right. */
export function ScreenLevelMapSlideTransition({
  screenKey,
  direction = 'forward',
  mode = 'enter',
  onExitComplete,
  children,
}: ScreenLevelMapSlideTransitionProps) {
  const { width: screenWidth } = useResponsive();
  const widthSV = useSharedValue(screenWidth);
  const progress = useSharedValue(mode === 'enter' ? 0 : 1);

  useEffect(() => {
    widthSV.value = screenWidth;
  }, [screenWidth, widthSV]);

  useEffect(() => {
    if (screenWidth <= 0) {
      progress.value = 1;
      return;
    }

    if (mode === 'exit') {
      progress.value = 0;
      progress.value = withTiming(
        1,
        { duration: SLIDE_DURATION_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished && onExitComplete) {
            runOnJS(onExitComplete)();
          }
        },
      );
      return;
    }

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: SLIDE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [screenKey, direction, mode, onExitComplete, progress, screenWidth]);

  const slideStyle = useAnimatedStyle(() => {
    const width = widthSV.value;
    if (width <= 0) {
      return {
        transform: [{ translateX: 0 }, { scale: 1 }],
        opacity: 1,
      };
    }

    if (mode === 'exit') {
      return {
        transform: [{ translateX: progress.value * width }],
        opacity: 1,
      };
    }

    const offset =
      direction === 'forward'
        ? (1 - progress.value) * width
        : -(1 - progress.value) * width;
    const scale = 0.96 + progress.value * 0.04;

    return {
      transform: [{ translateX: offset }, { scale }],
      opacity: progress.value,
    };
  });

  const layoutWidth = screenWidth > 0 ? screenWidth : undefined;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.slide, layoutWidth ? { width: layoutWidth } : styles.slideFull, slideStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.dark100,
    overflow: 'hidden',
  },
  slide: {
    flex: 1,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: -4, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        }
      : null),
  },
  slideFull: {
    flex: 1,
    width: '100%',
  },
});
