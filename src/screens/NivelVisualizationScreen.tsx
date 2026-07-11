import { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Level } from '../types/exercise';
import { SectionNivel, SECTION_NIVELES } from '../data/sectionNiveles';
import { ProgressMap } from '../components/ProgressMap';
import { SectionLevelPanel } from '../components/SectionLevelPanel';
import { StreakPanel } from '../components/StreakPanel';
import { useHomeShell } from '../components/HomeShell';
import { WarmupTokenPanel } from '../components/WarmupTokenPanel';
import { palette } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type HomePanel = 'none' | 'warmup' | 'streak';

const STICKY_HEADER_INDICES = SECTION_NIVELES.map((_, index) => index * 2);

type NivelVisualizationScreenProps = {
  levels: Level[];
  recentlyUnlockedId: string | null;
  warmupTokenActive: boolean;
  streakCount: number;
  exerciseDates: string[];
  initialSectionNivelId?: string;
  onRequestStartLesson: (level: Level) => void;
  onStartWarmup: () => void;
  onUnlockAnimationEnd: () => void;
  onNavigateBack: () => void;
};

function NivelPlaceholder({ nivel }: { nivel: SectionNivel }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{nivel.title}</Text>
      <Text style={styles.placeholderSubtitle}>{nivel.subtitle}</Text>
      <Text style={styles.placeholderHint}>
        {nivel.description ?? 'Contenido en desarrollo.'}
      </Text>
      <Text style={styles.placeholderBadge}>Próximamente</Text>
    </View>
  );
}

/** Menú de Visualización de Niveles — mapa de lecciones por capítulo */
export function NivelVisualizationScreen({
  levels,
  recentlyUnlockedId,
  warmupTokenActive,
  streakCount,
  exerciseDates,
  initialSectionNivelId = 'nivel-1',
  onRequestStartLesson,
  onStartWarmup,
  onUnlockAnimationEnd,
  onNavigateBack,
}: NivelVisualizationScreenProps) {
  const { streakAnchorRef, warmupAnchorRef, topBarActionsRef } = useHomeShell();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [activePanel, setActivePanel] = useState<HomePanel>('none');
  const [sectionOffsets, setSectionOffsets] = useState<Record<string, number>>({});

  const nivelScrollRef = useRef<ScrollView>(null);
  const hasScrolledToInitial = useRef(false);

  const handleNavigateBack = () => {
    setSelectedLevel(null);
    setActivePanel('none');
    onNavigateBack();
  };

  const handleSelectLevel = (level: Level) => {
    setActivePanel('none');
    if (selectedLevel?.id === level.id) {
      setSelectedLevel(null);
      return;
    }
    setSelectedLevel(level);
  };

  const handleContinue = () => {
    if (!selectedLevel || selectedLevel.status === 'locked') return;
    if (!selectedLevel.lessonId) return;
    const level = selectedLevel;
    setSelectedLevel(null);
    onRequestStartLesson(level);
  };

  const openStreakPanel = () => {
    setSelectedLevel(null);
    setActivePanel((p) => (p === 'streak' ? 'none' : 'streak'));
  };

  const openWarmupPanel = () => {
    setSelectedLevel(null);
    setActivePanel((p) => (p === 'warmup' ? 'none' : 'warmup'));
  };

  useEffect(() => {
    topBarActionsRef.current = {
      onOpenStreakPanel: openStreakPanel,
      onOpenWarmupPanel: openWarmupPanel,
    };
    return () => {
      topBarActionsRef.current = {};
    };
  }, [openStreakPanel, openWarmupPanel, topBarActionsRef]);

  const handleSectionLayout = (nivelId: string) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    setSectionOffsets((prev) => {
      if (prev[nivelId] === y) return prev;
      return { ...prev, [nivelId]: y };
    });
  };

  useEffect(() => {
    hasScrolledToInitial.current = false;
  }, [initialSectionNivelId]);

  useEffect(() => {
    if (hasScrolledToInitial.current) return;
    const offset = sectionOffsets[initialSectionNivelId];
    if (offset === undefined) return;

    const timeout = setTimeout(() => {
      nivelScrollRef.current?.scrollTo({ y: Math.max(0, offset - spacing.md), animated: true });
      hasScrolledToInitial.current = true;
    }, 200);
    return () => clearTimeout(timeout);
  }, [initialSectionNivelId, sectionOffsets]);

  return (
    <View style={styles.root}>
      <ScrollView
        ref={nivelScrollRef}
        style={styles.nivelScroll}
        contentContainerStyle={styles.nivelScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={STICKY_HEADER_INDICES}
      >
        {SECTION_NIVELES.flatMap((nivel, index) => [
          <View key={`header-${nivel.id}`} style={styles.stickyHeader}>
            <SectionLevelPanel
              title={nivel.title}
              subtitle={nivel.subtitle}
              onPress={handleNavigateBack}
            />
          </View>,
          <View
            key={`section-${nivel.id}`}
            onLayout={handleSectionLayout(nivel.id)}
            style={styles.nivelSection}
          >
            {index > 0 && <View style={styles.nivelDivider} />}
            {nivel.status === 'available' ? (
              <ProgressMap
                levels={levels}
                selectedLevel={selectedLevel}
                recentlyUnlockedId={recentlyUnlockedId}
                onSelectLevel={handleSelectLevel}
                onContinueLevel={handleContinue}
                onDismiss={() => setSelectedLevel(null)}
                onUnlockAnimationEnd={onUnlockAnimationEnd}
                embedInParentScroll
                parentScrollRef={nivelScrollRef}
                sectionOffsetY={sectionOffsets[nivel.id] ?? 0}
                disableInitialScroll={initialSectionNivelId !== nivel.id}
              />
            ) : (
              <NivelPlaceholder nivel={nivel} />
            )}
          </View>,
        ])}
      </ScrollView>

      <WarmupTokenPanel
        visible={activePanel === 'warmup'}
        anchorRef={warmupAnchorRef}
        isTokenActive={warmupTokenActive}
        onDismiss={() => setActivePanel('none')}
        onStartWarmup={onStartWarmup}
      />

      <StreakPanel
        visible={activePanel === 'streak'}
        anchorRef={streakAnchorRef}
        streakCount={streakCount}
        exerciseDates={exerciseDates}
        onDismiss={() => setActivePanel('none')}
      />

    </View>
  );
}

/** @deprecated use NivelVisualizationScreen */
export const HomeMapScreen = NivelVisualizationScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.dark100,
  },
  nivelScroll: {
    flex: 1,
  },
  nivelScrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  stickyHeader: {
    backgroundColor: palette.dark100,
    zIndex: 50,
    elevation: 50,
    ...(Platform.OS === 'web'
      ? ({ position: 'sticky', top: 0 } as object)
      : null),
  },
  nivelSection: {
    paddingBottom: spacing.lg,
  },
  nivelDivider: {
    height: 2,
    backgroundColor: palette.dark60,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 1,
  },
  placeholder: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: palette.dark80,
    borderWidth: 1,
    borderColor: palette.dark60,
    borderStyle: 'dashed',
    minHeight: 160,
    justifyContent: 'center',
  },
  placeholderTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: palette.light,
    textAlign: 'left',
    opacity: 0.7,
  },
  placeholderSubtitle: {
    fontFamily: fonts.title,
    fontSize: 12,
    color: palette.grey2,
    letterSpacing: 1.2,
    marginTop: 4,
    textAlign: 'left',
  },
  placeholderHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: palette.grey2,
    marginTop: spacing.sm,
    textAlign: 'left',
    lineHeight: 20,
  },
  placeholderBadge: {
    fontFamily: fonts.title,
    fontSize: fontSizes.sm,
    color: palette.turq,
    marginTop: spacing.md,
    textAlign: 'left',
  },
});
