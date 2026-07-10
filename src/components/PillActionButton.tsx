import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

type PillActionButtonProps = {
  variant: 'continue' | 'repeat' | 'locked';
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: object;
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
  locked: {
    topColor: '#4A4A4A',
    bottomColor: '#333333',
    label: 'BLOQUEADO',
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
  const isDisabled = disabled || variant === 'locked';

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? config.label}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.wrap,
        style,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <View style={styles.pill}>
        <View style={[styles.half, styles.topHalf, { backgroundColor: config.topColor }]} />
        <View style={[styles.half, styles.bottomHalf, { backgroundColor: config.bottomColor }]} />
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{config.label}</Text>
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
    color: colors.light,
    letterSpacing: 1,
    zIndex: 1,
  },
  labelDisabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
