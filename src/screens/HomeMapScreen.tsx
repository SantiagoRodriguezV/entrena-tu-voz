import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { UserProgress } from '../audio/xpSystem';
import { DEMO_USER } from '../data/levels';
import { Level } from '../types/exercise';
import { ProgressMap } from '../components/ProgressMap';
import { TopStatusBar } from '../components/TopStatusBar';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type HomeMapScreenProps = {
  levels: Level[];
  recentlyUnlockedId: string | null;
  userProgress: UserProgress;
  onStartLesson: (level: Level) => void;
  onOpenSettings: () => void;
  onOpenResearcher: () => void;
  onUnlockAnimationEnd: () => void;
};

export function HomeMapScreen({
  levels,
  recentlyUnlockedId,
  userProgress,
  onStartLesson,
  onOpenSettings,
  onOpenResearcher,
  onUnlockAnimationEnd,
}: HomeMapScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleSelectLevel = (level: Level) => {
    if (selectedLevel?.id === level.id) {
      setSelectedLevel(null);
      return;
    }
    setSelectedLevel(level);
  };

  const handleContinue = () => {
    if (!selectedLevel?.lessonId) return;
    const level = selectedLevel;
    setSelectedLevel(null);
    onStartLesson(level);
  };

  return (
    <SafeAreaView style={styles.root}>
      <TopStatusBar
        userProgress={userProgress}
        onOpenSettings={onOpenSettings}
        onLongPress={onOpenResearcher}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{DEMO_USER.sectionTitle}</Text>
        <Text style={styles.sectionSubtitle}>{DEMO_USER.sectionSubtitle}</Text>
      </View>

      <ProgressMap
        levels={levels}
        selectedLevel={selectedLevel}
        recentlyUnlockedId={recentlyUnlockedId}
        onSelectLevel={handleSelectLevel}
        onContinueLevel={handleContinue}
        onUnlockAnimationEnd={onUnlockAnimationEnd}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    backgroundColor: colors.secondary,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  sectionSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
});
