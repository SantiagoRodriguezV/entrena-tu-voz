import { RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import NavProfileIcon from '../../assets/icons/nav-profile.svg';
import NavSettingsIcon from '../../assets/icons/nav-settings.svg';
import RachaActivadaIcon from '../../assets/icons/racha-activada.svg';
import RachaApagadaIcon from '../../assets/icons/racha-apagada.svg';
import { UserProgress, getInitialUserProgress } from '../audio/xpSystem';
import { AppIcon } from './AppIcon';
import { LevelXpBadge } from './LevelXpBadge';
import { colors, palette } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';
import { useResponsive } from '../theme/responsive';

type TopStatusBarProps = {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onLongPress: () => void;
  userProgress?: UserProgress;
  streakActive: boolean;
  streakCount: number;
  warmupTokenActive: boolean;
  streakAnchorRef: RefObject<View | null>;
  warmupAnchorRef: RefObject<View | null>;
  onOpenStreakPanel: () => void;
  onOpenWarmupPanel: () => void;
};

const warmupActiveImage = require('../../assets/images/warmup-active.png');
const warmupInactiveImage = require('../../assets/images/warmup-inactive.png');

export function TopStatusBar({
  onOpenSettings,
  onOpenProfile,
  onLongPress,
  userProgress,
  streakActive,
  streakCount,
  warmupTokenActive,
  streakAnchorRef,
  warmupAnchorRef,
  onOpenStreakPanel,
  onOpenWarmupPanel,
}: TopStatusBarProps) {
  const { moderateScale } = useResponsive();
  const progress = userProgress ?? getInitialUserProgress();
  const iconSize = moderateScale(36);
  const badgeSize = moderateScale(44);

  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={1500}
      style={styles.wrapper}
      accessibilityRole="header"
    >
      <View style={styles.row}>
        <View style={styles.statsPill}>
          <LevelXpBadge progress={progress} size={badgeSize} />

          <View style={styles.divider} />

          <Pressable
            ref={streakAnchorRef}
            onPress={onOpenStreakPanel}
            style={styles.statItem}
            accessibilityRole="button"
            accessibilityLabel="Ver racha"
          >
            <AppIcon
              icon={streakActive ? RachaActivadaIcon : RachaApagadaIcon}
              size={iconSize}
              width={Math.round(iconSize * (289 / 416))}
              height={iconSize}
            />
            <Text style={styles.statValue}>{streakCount}</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            ref={warmupAnchorRef}
            onPress={onOpenWarmupPanel}
            accessibilityRole="button"
            accessibilityLabel="Token de calentamiento"
          >
            <AppIcon
              icon={warmupTokenActive ? warmupActiveImage : warmupInactiveImage}
              size={iconSize}
            />
          </Pressable>
        </View>

        <View style={styles.actionsPill}>
          <Pressable
            onPress={onOpenProfile}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel="Perfil"
          >
            <AppIcon icon={NavProfileIcon} size={iconSize} />
          </Pressable>

          <Pressable
            onPress={onOpenSettings}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
          >
            <AppIcon icon={NavSettingsIcon} size={iconSize} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: palette.dark80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statsPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  actionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.md,
    color: colors.light,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
