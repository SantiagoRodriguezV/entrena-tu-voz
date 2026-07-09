import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { UserProgress, getInitialUserProgress } from '../audio/xpSystem';
import { LevelXpBadge } from './LevelXpBadge';
import { DEMO_USER } from '../data/levels';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type TopStatusBarProps = {
  onOpenSettings: () => void;
  onLongPress: () => void;
  userProgress?: UserProgress;
};

const streakIcon = require('../../assets/images/streak-icon.png');
const warmupActiveImage = require('../../assets/images/warmup-active.png');
const warmupInactiveImage = require('../../assets/images/warmup-inactive.png');
const settingsImage = require('../../assets/images/settings.png');

export function TopStatusBar({
  onOpenSettings,
  onLongPress,
  userProgress,
}: TopStatusBarProps) {
  const progress = userProgress ?? getInitialUserProgress();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={1500}
        style={styles.row}
        accessibilityRole="header"
      >
        <View style={styles.statsPill}>
          <LevelXpBadge progress={progress} size={44} />

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Image source={streakIcon} style={styles.streakIcon} resizeMode="contain" />
            <Text style={styles.statValue}>{DEMO_USER.streak}</Text>
          </View>

          <View style={styles.divider} />

          <Image
            source={DEMO_USER.warmupActive ? warmupActiveImage : warmupInactiveImage}
            style={styles.warmupIcon}
            resizeMode="contain"
          />
        </View>

        <Pressable
          onPress={onOpenSettings}
          style={styles.settingsButton}
          accessibilityRole="button"
          accessibilityLabel="Ajustes"
        >
          <Image source={settingsImage} style={styles.settingsIcon} resizeMode="contain" />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakIcon: {
    width: 22,
    height: 22,
  },
  statValue: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  warmupIcon: {
    width: 28,
    height: 28,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    width: 28,
    height: 28,
    tintColor: colors.textSecondary,
  },
});
