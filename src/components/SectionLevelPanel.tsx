import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, withOpacity } from '../theme/colors';
import { SECTION_PANEL_HORIZONTAL_MARGIN, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type SectionLevelPanelProps = {
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export function SectionLevelPanel({ title, subtitle, onPress }: SectionLevelPanelProps) {
  const panel = (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );

  return (
    <View style={styles.wrap}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.panel, pressed && styles.panelPressed]}
          accessibilityRole="button"
          accessibilityLabel={`${title}. Volver al menú de selección de niveles`}
        >
          {panel}
        </Pressable>
      ) : (
        <View style={styles.panel}>{panel}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: SECTION_PANEL_HORIZONTAL_MARGIN,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    backgroundColor: withOpacity(palette.turqShadeHeavy1, 0.8),
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  panelPressed: {
    opacity: 0.88,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: palette.light,
    letterSpacing: fontSizes.lg * 0.03,
    lineHeight: fontSizes.lg * 1.2,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.title,
    fontSize: 12,
    color: palette.light,
    letterSpacing: 12 * 0.1,
    lineHeight: 12 * 1.2,
    marginTop: 4,
    textAlign: 'center',
  },
});
