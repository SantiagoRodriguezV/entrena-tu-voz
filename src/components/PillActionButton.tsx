import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

type PillActionButtonProps = {
  variant: 'continue' | 'repeat';
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  disabled?: boolean;
};

const VARIANTS = {
  continue: {
    topColor: colors.primary,
    bottomColor: colors.primaryShadow,
    label: 'CONTINUAR',
  },
  repeat: {
    topColor: '#5A5A5A',
    bottomColor: '#3A3A3A',
    label: 'REPETIR',
  },
} as const;

export function PillActionButton({
  variant,
  onPress,
  accessibilityLabel,
  style,
  disabled = false,
}: PillActionButtonProps) {
  const config = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? config.label}
      style={({ pressed }) => [
        styles.wrap,
        style,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.pill}>
        <View style={[styles.half, styles.topHalf, { backgroundColor: config.topColor }]} />
        <View style={[styles.half, styles.bottomHalf, { backgroundColor: config.bottomColor }]} />
        <Text style={styles.label}>{config.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 56,
  },
  pill: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  half: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '50%',
  },
  topHalf: {
    top: 0,
  },
  bottomHalf: {
    bottom: 0,
  },
  label: {
    fontFamily: fonts.title,
    fontSize: fontSizes.md,
    color: '#FFFFFF',
    letterSpacing: 1,
    zIndex: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
