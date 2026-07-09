import { Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Level, LevelCategory, LevelStatus } from '../types/exercise';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type LevelNodeProps = {
  level: Level;
  align: 'left' | 'right' | 'center';
  isSelected?: boolean;
  animateUnlock?: boolean;
  onPress?: () => void;
  onLayoutMeasured?: (layout: { cx: number; cy: number; bottom: number }) => void;
};

const platformCantoBlocked = require('../../assets/images/platform-canto-blocked.png');
const platformCantoAvailable = require('../../assets/images/platform-canto-available.png');
const platformCantoSelected = require('../../assets/images/platform-canto-selected.png');
const platformExtremoBlocked = require('../../assets/images/platform-extremo-blocked.png');
const platformExtremoAvailable = require('../../assets/images/platform-extremo-available.png');
const platformExtremoSelected = require('../../assets/images/platform-extremo-selected.png');

function getPlatformImages(category: LevelCategory, status: LevelStatus) {
  const isCanto = category === 'canto';
  if (status === 'locked') {
    return {
      base: isCanto ? platformCantoBlocked : platformExtremoBlocked,
      selected: null as number | null,
    };
  }
  return {
    base: isCanto ? platformCantoAvailable : platformExtremoAvailable,
    selected: isCanto ? platformCantoSelected : platformExtremoSelected,
  };
}

export function LevelNode({
  level,
  align,
  isSelected = false,
  animateUnlock = false,
  onPress,
  onLayoutMeasured,
}: LevelNodeProps) {
  const isLocked = level.status === 'locked';
  const isCompleted = level.status === 'completed';
  const isTappable = !isLocked && onPress;
  const showSelectionOverlay = level.status === 'unlocked' && isSelected;

  const scale = useSharedValue(animateUnlock ? 0.8 : 1);
  const opacity = useSharedValue(animateUnlock ? 0 : 1);
  const selectedOpacity = useSharedValue(showSelectionOverlay ? 1 : 0);
  const platformScale = useSharedValue(showSelectionOverlay ? 1.04 : 1);

  useEffect(() => {
    if (animateUnlock) {
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      opacity.value = withSpring(1, { damping: 14, stiffness: 100 });
    }
  }, [animateUnlock, opacity, scale]);

  useEffect(() => {
    if (showSelectionOverlay) {
      selectedOpacity.value = withTiming(1, { duration: 250 });
      platformScale.value = withTiming(1.04, { duration: 250 });
    } else {
      selectedOpacity.value = withTiming(0, { duration: 200 });
      platformScale.value = withTiming(1, { duration: 200 });
    }
  }, [platformScale, selectedOpacity, showSelectionOverlay]);

  const unlockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const platformAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: platformScale.value }],
  }));

  const selectedOverlayStyle = useAnimatedStyle(() => ({
    opacity: selectedOpacity.value,
  }));

  const { base, selected } = getPlatformImages(level.category, level.status);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    onLayoutMeasured?.({
      cx: x + width / 2,
      cy: y + height / 2,
      bottom: y + height,
    });
  };

  const content = (
    <Animated.View
      onLayout={handleLayout}
      style={[
        styles.wrapper,
        align === 'left' && styles.alignLeft,
        align === 'right' && styles.alignRight,
        align === 'center' && styles.alignCenter,
        isLocked && styles.locked,
        unlockStyle,
      ]}
    >
      <Animated.View style={[styles.platformStack, platformAnimStyle]}>
        <Image source={base} style={styles.platformImage} resizeMode="contain" />
        {selected !== null && (
          <Animated.View style={[styles.selectedOverlay, selectedOverlayStyle]}>
            <Image source={selected} style={styles.platformImage} resizeMode="contain" />
          </Animated.View>
        )}
        <Text style={styles.mapNumber}>{level.mapNumber}</Text>
        {isCompleted && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
        {isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>🔒</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );

  if (isTappable) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Nivel ${level.mapNumber}, ${level.title}`}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    width: 110,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  alignLeft: {
    alignSelf: 'flex-start',
    marginLeft: spacing.xl,
  },
  alignRight: {
    alignSelf: 'flex-end',
    marginRight: spacing.xl,
  },
  alignCenter: {
    alignSelf: 'center',
  },
  locked: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  platformStack: {
    width: 110,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformImage: {
    width: 110,
    height: 60,
    position: 'absolute',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapNumber: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    zIndex: 2,
    marginTop: -4,
  },
  checkBadge: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  checkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    zIndex: 3,
  },
  lockText: {
    fontSize: 16,
  },
});
