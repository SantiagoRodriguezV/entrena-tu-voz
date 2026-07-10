import { useEffect } from 'react';
import { Pressable, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import PlatformCantoBlocked from '../../assets/icons/platform-canto-blocked.svg';
import PlatformCantoAvailable from '../../assets/icons/platform-canto-available.svg';
import PlatformCantoSelected from '../../assets/icons/platform-canto-selected.svg';
import PlatformCantoCompleted from '../../assets/icons/platform-canto-completed.svg';
import PlatformExtremoBlocked from '../../assets/icons/platform-extremo-blocked.svg';
import PlatformExtremoAvailable from '../../assets/icons/platform-extremo-available.svg';
import PlatformExtremoSelected from '../../assets/icons/platform-extremo-selected.svg';
import PlatformExtremoCompleted from '../../assets/icons/platform-extremo-completed.svg';
import { AppIcon } from './AppIcon';
import { Level, LevelStatus, MapColumn, MapPlatform } from '../types/exercise';
import { getLevelAccent } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LevelNodeProps = {
  level: Level;
  align: MapColumn;
  isSelected?: boolean;
  animateUnlock?: boolean;
  onPress?: () => void;
  onLayoutMeasured?: (layout: { cx: number; cy: number; top: number; bottom: number }) => void;
};

const PLATFORM_WIDTH = 110;
const PLATFORM_HEIGHT = 70;
const PLATFORM_ICON_WIDTH = 110;
const PLATFORM_ICON_HEIGHT = 60;

type PlatformIcon = typeof PlatformCantoBlocked;

function getPlatformIcon(
  platform: MapPlatform,
  status: LevelStatus,
  isSelected: boolean,
): PlatformIcon {
  const isExtremo = platform === 'extremo';

  if (status === 'locked') {
    return isExtremo ? PlatformExtremoBlocked : PlatformCantoBlocked;
  }

  if (status === 'completed') {
    return isExtremo ? PlatformExtremoCompleted : PlatformCantoCompleted;
  }

  if (isSelected) {
    return isExtremo ? PlatformExtremoSelected : PlatformCantoSelected;
  }

  return isExtremo ? PlatformExtremoAvailable : PlatformCantoAvailable;
}

function getAlignStyle(align: MapColumn) {
  if (align === 'left') return styles.alignLeft;
  if (align === 'right') return styles.alignRight;
  return styles.alignCenter;
}

export function LevelNode({
  level,
  align,
  isSelected = false,
  animateUnlock = false,
  onPress,
  onLayoutMeasured,
}: LevelNodeProps) {
  const isTappable = Boolean(onPress);
  const showSelection = level.status === 'unlocked' && isSelected;
  const accent = getLevelAccent(level.category);
  const PlatformIconComponent = getPlatformIcon(level.platform, level.status, showSelection);

  const scale = useSharedValue(animateUnlock ? 0.8 : 1);
  const opacity = useSharedValue(animateUnlock ? 0 : 1);
  const platformScale = useSharedValue(showSelection ? 1.08 : 1);

  useEffect(() => {
    if (animateUnlock) {
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      opacity.value = withSpring(1, { damping: 14, stiffness: 100 });
    }
  }, [animateUnlock, opacity, scale]);

  useEffect(() => {
    platformScale.value = withTiming(showSelection ? 1.08 : 1, {
      duration: showSelection ? 250 : 200,
    });
  }, [platformScale, showSelection]);

  const unlockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const platformAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: platformScale.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    onLayoutMeasured?.({
      cx: x + width / 2,
      cy: y + height / 2,
      top: y,
      bottom: y + height,
    });
  };

  const platformContent = (
    <Animated.View
      style={[
        styles.platformStack,
        platformAnimStyle,
        unlockStyle,
        showSelection && [
          styles.selectedRing,
          { shadowColor: accent.accent },
        ],
      ]}
    >
      <View style={styles.platformImage}>
        <AppIcon
          icon={PlatformIconComponent}
          size={PLATFORM_ICON_HEIGHT}
          width={PLATFORM_ICON_WIDTH}
          height={PLATFORM_ICON_HEIGHT}
        />
      </View>
    </Animated.View>
  );

  if (isTappable) {
    return (
      <Pressable
        onPress={onPress}
        onLayout={handleLayout}
        accessibilityRole="button"
        accessibilityLabel={`${level.displayCode}, ${level.title}`}
        style={({ pressed }) => [
          styles.hitArea,
          getAlignStyle(align),
          pressed && styles.pressed,
          Platform.OS === 'web' && styles.webHitArea,
        ]}
      >
        {platformContent}
      </Pressable>
    );
  }

  return (
    <View
      onLayout={handleLayout}
      style={[styles.hitArea, getAlignStyle(align)]}
    >
      {platformContent}
    </View>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: PLATFORM_WIDTH,
    height: PLATFORM_HEIGHT,
    marginVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  alignLeft: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
  },
  alignRight: {
    alignSelf: 'flex-end',
    marginRight: spacing.md,
  },
  alignCenter: {
    alignSelf: 'center',
  },
  webHitArea: {
    cursor: 'pointer',
    outlineStyle: 'none',
  } as object,
  pressed: {
    opacity: 0.85,
  },
  platformStack: {
    width: PLATFORM_WIDTH,
    height: PLATFORM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRing: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  platformImage: {
    width: PLATFORM_ICON_WIDTH,
    height: PLATFORM_ICON_HEIGHT,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
