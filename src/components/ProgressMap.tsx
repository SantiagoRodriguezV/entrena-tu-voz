import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Level, NodeLayoutMetrics } from '../types/exercise';
import { LevelInfoPanel } from './LevelInfoPanel';
import { LevelNode } from './LevelNode';
import {
  BOTTOM_NAV_HEIGHT,
  BOTTOM_NAV_SAFE_MARGIN,
  PANEL_MAX_GAP_BELOW_NODE,
  PANEL_MIN_MARGIN_ABOVE_NAV,
  spacing,
} from '../theme/spacing';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type ProgressMapProps = {
  levels: Level[];
  selectedLevel: Level | null;
  recentlyUnlockedId: string | null;
  onSelectLevel: (level: Level) => void;
  onContinueLevel: () => void;
  onUnlockAnimationEnd?: () => void;
};

export const NODE_HEIGHT = 168;
const PATH_WIDTH = 280;
const UNLOCKED_PATH_COLOR = '#0D6E74';
const LOCKED_PATH_COLOR = '#3A3A3A';
const ESTIMATED_PANEL_HEIGHT = 260;

function getAlignment(index: number): 'left' | 'right' | 'center' {
  if (index % 3 === 0) return 'center';
  if (index % 2 === 0) return 'right';
  return 'left';
}

function isSegmentUnlocked(levels: Level[], segmentIndex: number): boolean {
  const to = levels[segmentIndex + 1];
  return to?.status !== 'locked';
}

type ConnectorSegmentProps = {
  index: number;
  levels: Level[];
  nodeLayouts: Record<string, NodeLayoutMetrics>;
  animateUnlock: boolean;
};

function ConnectorSegment({
  index,
  levels,
  nodeLayouts,
  animateUnlock,
}: ConnectorSegmentProps) {
  const from = levels[index];
  const to = levels[index + 1];
  const fromLayout = from ? nodeLayouts[from.id] : undefined;
  const toLayout = to ? nodeLayouts[to.id] : undefined;

  const targetUnlocked = isSegmentUnlocked(levels, index);
  const progress = useSharedValue(targetUnlocked && !animateUnlock ? 1 : 0);

  useEffect(() => {
    if (targetUnlocked) {
      progress.value = withTiming(1, { duration: animateUnlock ? 600 : 0 });
    } else {
      progress.value = 0;
    }
  }, [animateUnlock, progress, targetUnlocked]);

  const animatedProps = useAnimatedProps(() => {
    const t = progress.value;
    const r1 = parseInt(UNLOCKED_PATH_COLOR.slice(1, 3), 16);
    const g1 = parseInt(UNLOCKED_PATH_COLOR.slice(3, 5), 16);
    const b1 = parseInt(UNLOCKED_PATH_COLOR.slice(5, 7), 16);
    const r2 = parseInt(LOCKED_PATH_COLOR.slice(1, 3), 16);
    const g2 = parseInt(LOCKED_PATH_COLOR.slice(3, 5), 16);
    const b2 = parseInt(LOCKED_PATH_COLOR.slice(5, 7), 16);
    const r = Math.round(r2 + (r1 - r2) * t);
    const g = Math.round(g2 + (g1 - g2) * t);
    const b = Math.round(b2 + (b1 - b2) * t);
    return { stroke: `rgb(${r}, ${g}, ${b})` };
  });

  if (!fromLayout || !toLayout) return null;

  const d = `M ${fromLayout.cx} ${fromLayout.cy} L ${toLayout.cx} ${toLayout.cy}`;

  return (
    <AnimatedPath
      d={d}
      strokeWidth={4}
      fill="none"
      strokeLinecap="round"
      animatedProps={animatedProps}
    />
  );
}

export function ProgressMap({
  levels,
  selectedLevel,
  recentlyUnlockedId,
  onSelectLevel,
  onContinueLevel,
  onUnlockAnimationEnd,
}: ProgressMapProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { height: windowHeight } = useWindowDimensions();
  const [nodeLayouts, setNodeLayouts] = useState<Record<string, NodeLayoutMetrics>>({});
  const hasScrolledRef = useRef(false);

  const mapHeight = levels.length * NODE_HEIGHT + spacing.xxl;
  const panelAnchor = selectedLevel ? nodeLayouts[selectedLevel.id] : undefined;

  const navReserved =
    BOTTOM_NAV_HEIGHT + BOTTOM_NAV_SAFE_MARGIN + PANEL_MIN_MARGIN_ABOVE_NAV;

  const panelTop = panelAnchor
    ? (() => {
        const gap = PANEL_MAX_GAP_BELOW_NODE;
        let top = panelAnchor.bottom + gap;
        const maxTop =
          mapHeight -
          ESTIMATED_PANEL_HEIGHT -
          (PANEL_MIN_MARGIN_ABOVE_NAV + BOTTOM_NAV_SAFE_MARGIN);
        if (top > maxTop) {
          top = Math.max(panelAnchor.bottom + 16, maxTop);
        }
        return top;
      })()
    : 0;

  const handleNodeLayout = useCallback((levelId: string, layout: NodeLayoutMetrics) => {
    setNodeLayouts((prev) => {
      const existing = prev[levelId];
      if (
        existing &&
        existing.cx === layout.cx &&
        existing.cy === layout.cy &&
        existing.bottom === layout.bottom
      ) {
        return prev;
      }
      return { ...prev, [levelId]: layout };
    });
  }, []);

  useEffect(() => {
    if (hasScrolledRef.current) return;
    const unlockedIndex = levels.findIndex((l) => l.status === 'unlocked');
    if (unlockedIndex < 0) return;

    const targetY = Math.max(0, unlockedIndex * NODE_HEIGHT - NODE_HEIGHT * 0.5);
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
      hasScrolledRef.current = true;
    }, 300);
    return () => clearTimeout(timeout);
  }, [levels]);

  useEffect(() => {
    if (!recentlyUnlockedId) return;
    const index = levels.findIndex((l) => l.id === recentlyUnlockedId);
    if (index < 0) return;

    const targetY = Math.max(0, index * NODE_HEIGHT - NODE_HEIGHT * 0.5);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });

    const timer = setTimeout(() => onUnlockAnimationEnd?.(), 700);
    return () => clearTimeout(timer);
  }, [levels, onUnlockAnimationEnd, recentlyUnlockedId]);

  useEffect(() => {
    if (!selectedLevel || !panelAnchor) return;
    const scrollTarget = Math.max(
      0,
      panelTop + ESTIMATED_PANEL_HEIGHT + navReserved - windowHeight,
    );
    scrollRef.current?.scrollTo({ y: scrollTarget, animated: true });
  }, [navReserved, panelAnchor, panelTop, selectedLevel, windowHeight]);

  const contentPaddingBottom =
    BOTTOM_NAV_HEIGHT +
    BOTTOM_NAV_SAFE_MARGIN +
    PANEL_MIN_MARGIN_ABOVE_NAV +
    (selectedLevel ? ESTIMATED_PANEL_HEIGHT : spacing.xxl);

  return (
    <View style={styles.flex}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mapContainer, { height: mapHeight }]}>
          <Svg
            width={PATH_WIDTH}
            height={mapHeight}
            style={styles.svg}
            pointerEvents="none"
          >
            {levels.slice(0, -1).map((_, index) => {
              const animatesUnlock =
                recentlyUnlockedId !== null &&
                levels[index + 1]?.id === recentlyUnlockedId;
              return (
                <ConnectorSegment
                  key={`path-${index}`}
                  index={index}
                  levels={levels}
                  nodeLayouts={nodeLayouts}
                  animateUnlock={animatesUnlock}
                />
              );
            })}
          </Svg>

          {levels.map((level, index) => (
            <View key={level.id} style={[styles.nodeRow, { top: index * NODE_HEIGHT }]}>
              <LevelNode
                level={level}
                align={getAlignment(index)}
                isSelected={selectedLevel?.id === level.id}
                animateUnlock={recentlyUnlockedId === level.id}
                onLayoutMeasured={(layout) => handleNodeLayout(level.id, layout)}
                onPress={
                  level.status !== 'locked'
                    ? () => onSelectLevel(level)
                    : undefined
                }
              />
            </View>
          ))}

          {selectedLevel && panelAnchor && (
            <LevelInfoPanel
              level={selectedLevel}
              top={panelTop}
              onContinue={onContinueLevel}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  mapContainer: {
    alignSelf: 'center',
    width: PATH_WIDTH,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  nodeRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
