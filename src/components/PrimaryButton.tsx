import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, minTouchSize, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  loading = false,
  accessibilityLabel,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles: ViewStyle[] = [styles.button];
  const textStyles: TextStyle[] = [styles.label];

  if (variant === 'primary') {
    buttonStyles.push(styles.primary);
  } else if (variant === 'secondary') {
    buttonStyles.push(styles.secondary);
  } else {
    buttonStyles.push(styles.outline);
    textStyles.push(styles.outlineLabel);
  }

  if (isDisabled) {
    buttonStyles.push(styles.disabled);
  }

  return (
    <View style={[variant === 'primary' && styles.shadowWrap, style]}>
      {variant === 'primary' && <View style={styles.primaryShadow} />}
      <Pressable
        style={[...buttonStyles, variant === 'primary' && styles.primaryRaised]}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isDisabled }}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFF'} />
        ) : (
          <Text style={[...textStyles, isDisabled && styles.disabledLabel]}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    width: '100%',
    position: 'relative',
  },
  primaryShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: minTouchSize,
    backgroundColor: colors.primaryShadow,
    borderRadius: borderRadius.md,
    transform: [{ translateY: 4 }],
  },
  button: {
    minHeight: minTouchSize,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryRaised: {
    transform: [{ translateY: -2 }],
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  label: {
    color: '#FFFFFF',
    fontSize: fontSizes.lg,
    fontFamily: fonts.title,
    letterSpacing: 0.5,
  },
  outlineLabel: {
    color: colors.textPrimary,
  },
  disabledLabel: {
    color: '#FFFFFF',
  },
});
