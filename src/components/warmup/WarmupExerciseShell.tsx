import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts, fontSizes } from '../../theme/typography';

type WarmupExerciseShellProps = {
  lessonTitle: string;
  vowelLabel: string;
  children: ReactNode;
  hint?: string;
  score?: number;
  showPause?: boolean;
  onPause?: () => void;
  footer?: ReactNode;
};

export function WarmupExerciseShell({
  lessonTitle,
  vowelLabel,
  children,
  hint,
  score,
  showPause = false,
  onPause,
  footer,
}: WarmupExerciseShellProps) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {showPause ? (
          <Pressable
            onPress={onPause}
            accessibilityRole="button"
            accessibilityLabel="Pausar"
            style={({ pressed }) => [styles.pauseButton, pressed && styles.pressed]}
          >
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </Pressable>
        ) : (
          <View style={styles.pausePlaceholder} />
        )}
        <Text style={styles.lessonTitle}>{lessonTitle}</Text>
      </View>

      <Text style={styles.vowel}>{vowelLabel}</Text>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <View style={styles.band}>{children}</View>

      <View style={styles.footer}>
        {footer ?? (
          score !== undefined ? (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreIcon}>♪</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          ) : null
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2B2B2B',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  pausePlaceholder: {
    width: 40,
    height: 40,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3A3A3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  lessonTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.secondary,
    letterSpacing: 1,
  },
  vowel: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  band: {
    flex: 1,
    backgroundColor: '#383838',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  footer: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreIcon: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.secondary,
  },
  scoreValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: '#FFFFFF',
  },
});
