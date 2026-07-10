import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExerciseBackHeader } from '../ExerciseBackHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts, exerciseTitleType, fontSizes } from '../../theme/typography';
import { useResponsive } from '../../theme/responsive';

type WarmupExerciseShellProps = {
  lessonTitle: string;
  vowelLabel: string;
  children: ReactNode;
  hint?: string;
  score?: number;
  showPause?: boolean;
  onPause?: () => void;
  onBack?: () => void;
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
  onBack,
  footer,
}: WarmupExerciseShellProps) {
  const { width, height, moderateScale } = useResponsive();
  const isLandscape = width > height;
  const controlSize = moderateScale(isLandscape ? 36 : 40);

  return (
    <View style={[styles.root, isLandscape && styles.rootLandscape]}>
      <View style={[styles.header, isLandscape && styles.headerLandscape]}>
        {onBack ? (
          <ExerciseBackHeader onConfirmBack={onBack} />
        ) : (
          <View style={[styles.controlPlaceholder, { width: controlSize, height: controlSize }]} />
        )}
        {showPause ? (
          <Pressable
            onPress={onPause}
            accessibilityRole="button"
            accessibilityLabel="Pausar"
            style={({ pressed }) => [
              styles.pauseButton,
              { width: controlSize, height: controlSize },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </Pressable>
        ) : (
          <View style={[styles.controlPlaceholder, { width: controlSize, height: controlSize }]} />
        )}
        <Text style={styles.lessonTitle}>{lessonTitle}</Text>
      </View>

      <Text style={styles.vowel}>{vowelLabel}</Text>

      {hint ? (
        <Text style={[styles.hint, isLandscape && styles.hintLandscape]}>{hint}</Text>
      ) : null}

      <View style={[styles.band, isLandscape && styles.bandLandscape]}>{children}</View>

      <View style={[styles.footer, isLandscape && styles.footerLandscape]}>
        {footer ??
          (score !== undefined ? (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreIcon}>♪</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          ) : null)}
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
  rootLandscape: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerLandscape: {
    marginBottom: 2,
  },
  controlPlaceholder: {
    flexShrink: 0,
  },
  pauseButton: {
    borderRadius: 10,
    backgroundColor: '#3A3A3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    flexShrink: 0,
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: colors.light,
    borderRadius: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  lessonTitle: {
    fontFamily: fonts.title,
    fontSize: exerciseTitleType.fontSize,
    lineHeight: exerciseTitleType.lineHeight,
    letterSpacing: exerciseTitleType.letterSpacing,
    color: colors.secondary,
    flex: 1,
  },
  vowel: {
    fontFamily: fonts.title,
    fontSize: exerciseTitleType.fontSize,
    lineHeight: exerciseTitleType.lineHeight,
    letterSpacing: exerciseTitleType.letterSpacing,
    color: colors.light,
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
  hintLandscape: {
    marginBottom: spacing.xs,
    fontSize: fontSizes.xs,
  },
  band: {
    flex: 1,
    backgroundColor: '#383838',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 100,
  },
  bandLandscape: {
    minHeight: 80,
  },
  footer: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  footerLandscape: {
    minHeight: 36,
    marginTop: spacing.xs,
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
    color: colors.light,
  },
});
