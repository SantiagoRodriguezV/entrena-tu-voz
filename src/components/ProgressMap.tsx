import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { getMaxMapRow } from '../data/levels';
import { MAP_EDGES } from '../data/mapEdges';
import { Level, NodeLayoutMetrics } from '../types/exercise';
import { colors, getLevelAccent } from '../theme/colors';
import { LevelInfoPanel, PANEL_WIDTH_BASE } from './LevelInfoPanel';
import { LevelNode } from './LevelNode';
import { useResponsive } from '../theme/responsive';
import {
  BOTTOM_NAV_HEIGHT,
  BOTTOM_NAV_SAFE_MARGIN,
  PANEL_ANCHOR_GAP,
  PANEL_MIN_MARGIN_ABOVE_NAV,
  spacing,
} from '../theme/spacing';

const AnimatedPath = Platform.OS === 'web' ? Path : Animated.createAnimatedComponent(Path);

export const NODE_HEIGHT_BASE = 168;
export const PATH_WIDTH_BASE = 340;
/** @deprecated use PATH_WIDTH_BASE with useResponsive */
export const NODE_HEIGHT = NODE_HEIGHT_BASE;
/** @deprecated use PATH_WIDTH_BASE with useResponsive */
export const PATH_WIDTH = PATH_WIDTH_BASE;
const LOCKED_PATH_COLOR = colors.border;
const ESTIMATED_PANEL_HEIGHT = 260;

function buildDownwardPath(from: NodeLayoutMetrics, to: NodeLayoutMetrics): string {
  const midY = from.bottom + Math.max(16, (to.top - from.bottom) * 0.45);
  return [
    `M ${from.cx} ${from.bottom}`,
    `L ${from.cx} ${midY}`,
    `L ${to.cx} ${midY}`,
    `L ${to.cx} ${to.top}`,
  ].join(' ');
}

type ConnectorSegmentProps = {
  edgeKey: string;
  fromLayout: NodeLayoutMetrics;
  toLayout: NodeLayoutMetrics;
  targetUnlocked: boolean;
  animateUnlock: boolean;
  unlockedColor: string;
};

function ConnectorSegment({
  edgeKey,
  fromLayout,
  toLayout,
  targetUnlocked,
  animateUnlock,
  unlockedColor,
}: ConnectorSegmentProps) {
  const progress = useSharedValue(targetUnlocked && !animateUnlock ? 1 : 0);

  useEffect(() => {
    if (targetUnlocked) {
      progress.value = withTiming(1, { duration: animateUnlock ? 600 : 0 });
    } else {
      progress.value = 0;
    }
  }, [animateUnlock, progress, targetUnlocked]);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    if (!targetUnlocked) {
      return { stroke: LOCKED_PATH_COLOR };
    }
    return {
      stroke: interpolateColor(progress.value, [0, 1], [LOCKED_PATH_COLOR, unlockedColor]),
    };
  });

  const d = buildDownwardPath(fromLayout, toLayout);

  if (Platform.OS === 'web') {
    return (
      <Path
        key={edgeKey}
        d={d}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        stroke={targetUnlocked ? unlockedColor : LOCKED_PATH_COLOR}
      />
    );
  }

  return (
    <AnimatedPath
      key={edgeKey}
      d={d}
      strokeWidth={4}
      fill="none"
      strokeLinecap="round"
      animatedProps={animatedProps}
    />
  );
}

type ProgressMapProps = {
  levels: Level[];
  selectedLevel: Level | null;
  recentlyUnlockedId: string | null;
  onSelectLevel: (level: Level) => void;
  onContinueLevel: () => void;
  onDismiss: () => void;
  onUnlockAnimationEnd?: () => void;
  embedInParentScroll?: boolean;
  parentScrollRef?: RefObject<ScrollView | null>;
  sectionOffsetY?: number;
  disableInitialScroll?: boolean;
};

export function ProgressMap({
  levels,
  selectedLevel,
  recentlyUnlockedId,
  onSelectLevel,
  onContinueLevel,
  onDismiss,
  onUnlockAnimationEnd,
  embedInParentScroll = false,
  parentScrollRef,
  sectionOffsetY = 0,
  disableInitialScroll = false,
}: ProgressMapProps) {
  const internalScrollRef = useRef<ScrollView>(null);
  const scrollRef = embedInParentScroll ? parentScrollRef : internalScrollRef;
  const { height: windowHeight, moderateScale } = useResponsive();
  const pathWidth = moderateScale(PATH_WIDTH_BASE);
  const nodeHeight = moderateScale(NODE_HEIGHT_BASE);
  const mapTopOffset = moderateScale(72);
  const [nodeLayouts, setNodeLayouts] = useState<Record<string, NodeLayoutMetrics>>({});
  const hasScrolledRef = useRef(false);

  const maxRow = getMaxMapRow(levels);
  const mapHeight = mapTopOffset + (maxRow + 1) * nodeHeight + spacing.xxl;
  const panelAnchor = selectedLevel ? nodeLayouts[selectedLevel.id] : undefined;

  const navReserved =
    BOTTOM_NAV_HEIGHT + BOTTOM_NAV_SAFE_MARGIN + PANEL_MIN_MARGIN_ABOVE_NAV;

  const panelTop = panelAnchor ? panelAnchor.bottom + PANEL_ANCHOR_GAP : 0;

  const scrollToY = useCallback(
    (y: number, animated = true) => {
      scrollRef?.current?.scrollTo({ y, animated });
    },
    [scrollRef],
  );

  const handleNodeLayout = useCallback((levelId: string, layout: NodeLayoutMetrics) => {
    setNodeLayouts((prev) => {
      const existing = prev[levelId];
      if (
        existing &&
        existing.cx === layout.cx &&
        existing.cy === layout.cy &&
        existing.top === layout.top &&
        existing.bottom === layout.bottom
      ) {
        return prev;
      }
      return { ...prev, [levelId]: layout };
    });
  }, []);

  useEffect(() => {
    if (disableInitialScroll || hasScrolledRef.current) return;
    const c1 = levels.find((l) => l.id === 'c1');
    if (!c1) return;

    const innerY = Math.max(0, mapTopOffset + c1.mapRow * nodeHeight - nodeHeight * 0.25);
    const targetY = embedInParentScroll ? sectionOffsetY + innerY : innerY;
    const timeout = setTimeout(() => {
      scrollToY(targetY, true);
      hasScrolledRef.current = true;
    }, 300);
    return () => clearTimeout(timeout);
  }, [disableInitialScroll, embedInParentScroll, levels, mapTopOffset, nodeHeight, scrollToY, sectionOffsetY]);

  useEffect(() => {
    if (!recentlyUnlockedId) return;
    const level = levels.find((l) => l.id === recentlyUnlockedId);
    if (!level) return;

    const innerY = Math.max(0, mapTopOffset + level.mapRow * nodeHeight - nodeHeight * 0.5);
    scrollToY(embedInParentScroll ? sectionOffsetY + innerY : innerY, true);

    const timer = setTimeout(() => onUnlockAnimationEnd?.(), 700);
    return () => clearTimeout(timer);
  }, [
    embedInParentScroll,
    levels,
    mapTopOffset,
    nodeHeight,
    onUnlockAnimationEnd,
    recentlyUnlockedId,
    scrollToY,
    sectionOffsetY,
  ]);

  useEffect(() => {
    if (!selectedLevel || !panelAnchor) return;
    const innerTarget = Math.max(
      0,
      panelTop + ESTIMATED_PANEL_HEIGHT + navReserved - windowHeight,
    );
    scrollToY(embedInParentScroll ? sectionOffsetY + innerTarget : innerTarget, true);
  }, [
    embedInParentScroll,
    navReserved,
    panelAnchor,
    panelTop,
    scrollToY,
    sectionOffsetY,
    selectedLevel,
    windowHeight,
  ]);

  const contentPaddingBottom = embedInParentScroll
    ? selectedLevel
      ? ESTIMATED_PANEL_HEIGHT + spacing.lg
      : spacing.lg
    : BOTTOM_NAV_HEIGHT +
      BOTTOM_NAV_SAFE_MARGIN +
      PANEL_MIN_MARGIN_ABOVE_NAV +
      (selectedLevel ? ESTIMATED_PANEL_HEIGHT : spacing.xxl);

  const levelById = Object.fromEntries(levels.map((l) => [l.id, l]));

  const mapContent = (
    <View
      style={[
        styles.mapContainer,
        { height: mapHeight, width: pathWidth, paddingBottom: embedInParentScroll ? contentPaddingBottom : 0 },
      ]}
    >
      <Svg width={pathWidth} height={mapHeight} style={styles.svg} pointerEvents="none">
        {MAP_EDGES.map((edge) => {
          const fromLayout = nodeLayouts[edge.from];
          const toLayout = nodeLayouts[edge.to];
          if (!fromLayout || !toLayout) return null;

          const toLevel = levelById[edge.to];
          const targetUnlocked = toLevel?.status !== 'locked';
          const animatesUnlock = recentlyUnlockedId === edge.to;
          const unlockedColor = toLevel
            ? getLevelAccent(toLevel.category).border
            : getLevelAccent('canto').border;

          return (
            <ConnectorSegment
              key={`${edge.from}-${edge.to}`}
              edgeKey={`${edge.from}-${edge.to}`}
              fromLayout={fromLayout}
              toLayout={toLayout}
              targetUnlocked={targetUnlocked}
              animateUnlock={animatesUnlock}
              unlockedColor={unlockedColor}
            />
          );
        })}
      </Svg>

      {selectedLevel && (
        <Pressable
          style={[styles.dismissOverlay, embedInParentScroll && styles.dismissOverlayEmbedded]}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cerrar panel"
        />
      )}

      {levels.map((level) => (
        <View
          key={level.id}
          style={[
            styles.nodeRow,
            embedInParentScroll && styles.nodeRowEmbedded,
            { top: mapTopOffset + level.mapRow * nodeHeight },
          ]}
          pointerEvents="box-none"
        >
          <LevelNode
            level={level}
            align={level.mapColumn}
            isSelected={selectedLevel?.id === level.id}
            animateUnlock={recentlyUnlockedId === level.id}
            onLayoutMeasured={(layout) =>
              handleNodeLayout(level.id, {
                cx: layout.cx,
                cy: layout.cy + mapTopOffset + level.mapRow * nodeHeight,
                top: layout.top + mapTopOffset + level.mapRow * nodeHeight,
                bottom: layout.bottom + mapTopOffset + level.mapRow * nodeHeight,
              })
            }
            onPress={() => onSelectLevel(level)}
          />
        </View>
      ))}

      {selectedLevel && panelAnchor && (
        <LevelInfoPanel
          level={selectedLevel}
          anchor={panelAnchor}
          mapWidth={pathWidth}
          onContinue={onContinueLevel}
          embedded={embedInParentScroll}
        />
      )}
    </View>
  );

  if (embedInParentScroll) {
    return mapContent;
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        ref={internalScrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mapContent}
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
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  nodeRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  nodeRowEmbedded: {
    zIndex: 8,
    elevation: 8,
  },
  dismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
  dismissOverlayEmbedded: {
    zIndex: 6,
    elevation: 6,
  },
});

export { PANEL_WIDTH_BASE as PANEL_WIDTH };

export function getProgressMapHeight(levels: Level[], scale = 1): number {
  const maxRow = getMaxMapRow(levels);
  return (maxRow + 1) * NODE_HEIGHT_BASE * scale + spacing.xxl + spacing.lg;
}
