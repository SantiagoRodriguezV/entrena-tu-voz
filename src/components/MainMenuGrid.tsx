import NavAprendeActive from '../../assets/icons/nav-aprende-active.svg';
import NavEntrenaActive from '../../assets/icons/nav-entrena-active.svg';
import NavDesafiosActive from '../../assets/icons/nav-desafios-active.svg';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { MainMenuDestination } from '../types/navigation';
import { palette, withOpacity } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';
import { useResponsive } from '../theme/responsive';

const dailySessionIcon = require('../../assets/images/warmup-active.png');

type MainMenuGridProps = {
  onNavigate: (destination: MainMenuDestination) => void;
};

type TileProps = {
  label: string;
  subtitle?: string;
  icon: Parameters<typeof AppIcon>[0]['icon'];
  size: 'main' | 'small';
  onPress: () => void;
};

const ICON_SIZE_MAIN_BASE = 40;
const ICON_SIZE_SMALL_BASE = 32;

function MenuTile({ label, subtitle, icon, size, onPress }: TileProps) {
  const { moderateScale } = useResponsive();
  const iconSize = moderateScale(size === 'small' ? ICON_SIZE_SMALL_BASE : ICON_SIZE_MAIN_BASE);
  const labelStyle =
    size === 'main'
      ? { fontSize: moderateScale(fontSizes.xl) }
      : { fontSize: moderateScale(fontSizes.lg) };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        size === 'main' ? styles.tileMain : styles.tileSmall,
        { minHeight: moderateScale(size === 'main' ? 108 : 76) },
        pressed && styles.tilePressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.tileTitleRow}>
        <AppIcon icon={icon} size={iconSize} />
        <Text style={[styles.tileLabel, labelStyle]}>{label}</Text>
      </View>
      {subtitle ? (
        <Text style={[styles.tileSubtitle, { marginLeft: iconSize + spacing.sm }]}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function MainMenuGrid({ onNavigate }: MainMenuGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <MenuTile
          label="Aprende"
          icon={NavAprendeActive}
          size="main"
          onPress={() => onNavigate('aprende')}
        />
        <MenuTile
          label="Entrena"
          icon={NavEntrenaActive}
          size="main"
          onPress={() => onNavigate('entrena')}
        />
      </View>

      <View style={styles.row}>
        <MenuTile
          label="Sesión Diaria"
          subtitle="Calentamiento diario"
          icon={dailySessionIcon}
          size="main"
          onPress={() => onNavigate('dailySession')}
        />
        <MenuTile
          label="Desafíos"
          icon={NavDesafiosActive}
          size="main"
          onPress={() => onNavigate('desafios')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  tileMain: {
    backgroundColor: withOpacity(palette.turqShadeHeavy1, 0.85),
  },
  tileSmall: {
    backgroundColor: withOpacity(palette.dark70, 0.95),
    borderWidth: 1,
    borderColor: palette.dark60,
  },
  tilePressed: {
    opacity: 0.88,
  },
  tileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tileLabel: {
    fontFamily: fonts.title,
    color: palette.light,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  tileSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: palette.light,
    opacity: 0.75,
    marginTop: spacing.xs,
  },
});
