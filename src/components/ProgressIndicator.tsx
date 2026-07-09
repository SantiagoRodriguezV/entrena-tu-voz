import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type ProgressIndicatorProps = {
  steps: string[];
  activeIndex: number;
};

export function ProgressIndicator({ steps, activeIndex }: ProgressIndicatorProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      {steps.map((step, index) => {
        const isActive = index <= activeIndex;
        const isCurrent = index === activeIndex;
        return (
          <View key={step} style={styles.stepRow}>
            <View
              style={[
                styles.dot,
                isActive && styles.dotActive,
                isCurrent && styles.dotCurrent,
              ]}
            />
            <Text
              style={[
                styles.stepText,
                isActive && styles.stepTextActive,
                isCurrent && styles.stepTextCurrent,
              ]}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.secondary,
  },
  dotCurrent: {
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.textMuted,
  },
  stepTextActive: {
    color: colors.textSecondary,
  },
  stepTextCurrent: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
