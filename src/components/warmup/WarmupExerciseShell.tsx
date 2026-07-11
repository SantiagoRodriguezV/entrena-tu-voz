import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseBackHeader } from '../ExerciseBackHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import {
  fonts,
  exerciseSessionTitleType,
  exerciseTitleType,
  fontSizes,
} from '../../theme/typography';
import { useResponsive } from '../../theme/responsive';
import { getExerciseBandMetrics } from '../../theme/warmupLaneMetrics';
import PausaIcon from '../../../assets/icons/pausa.svg';
import { ExercisePauseOverlay } from './ExercisePauseOverlay';

type WarmupExerciseShellProps = {
  lessonTitle: string;
  vowelLabel: string;
  children: ReactNode;
  hint?: string;
  score?: number;
  showPause?: boolean;
  /** Called when pause overlay opens/closes so parent can freeze timeline/audio. */
  onPausedChange?: (paused: boolean) => void;
  onRestartSession?: () => void;
  onExitToLessonMenu?: () => void;
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
  onPausedChange,
  onRestartSession,
  onExitToLessonMenu,
  onBack,
  footer,
}: WarmupExerciseShellProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useResponsive();
  const isLandscape = width > height;
  const band = getExerciseBandMetrics(width, height);
  const scaleX = width / 1055;
  const scaleY = height / 412;
  const pauseSize = isLandscape ? 32 * scaleX : 32;
  const pauseLeft = isLandscape ? 32 * scaleX : 32;
  const pauseTop = isLandscape ? 24 * scaleY : 24;
  const scoreBottom = isLandscape ? 24 * scaleY : 24;

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    onPausedChange?.(paused);
  }, [paused, onPausedChange]);

  const openPause = () => setPaused(true);
  const closePause = () => setPaused(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {showPause ? (
        <Pressable
          onPress={openPause}
          accessibilityRole="button"
          accessibilityLabel="Pausar"
          style={({ pressed }) => [
            styles.pauseButton,
            {
              width: pauseSize,
              height: pauseSize,
              left: pauseLeft,
              top: insets.top + pauseTop,
            },
            pressed && styles.pressed,
          ]}
        >
          <PausaIcon width={pauseSize} height={pauseSize} />
        </Pressable>
      ) : null}

      <View
        style={[
          styles.topChrome,
          {
            height: Math.max(band.marginTop - 8, isLandscape ? 56 : 72),
            paddingLeft: Math.max(
              band.marginLeft,
              showPause ? pauseLeft + pauseSize + 8 : band.marginLeft,
            ),
            paddingRight: band.marginRight,
          },
        ]}
      >
        <View style={styles.headerRow}>
          {onBack ? (
            <ExerciseBackHeader onConfirmBack={onBack} />
          ) : (
            <View style={styles.controlPlaceholder} />
          )}
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>
        </View>
        <Text style={styles.vowel}>{vowelLabel}</Text>
        {hint ? (
          <Text
            style={[styles.hint, isLandscape && styles.hintLandscape]}
            numberOfLines={1}
          >
            {hint}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.band,
          {
            width: band.bandWidth,
            height: band.bandHeight,
            marginLeft: band.marginLeft,
            marginRight: band.marginRight,
          },
        ]}
      >
        {children}
      </View>

      <View style={[styles.footer, { marginBottom: scoreBottom }]}>
        {footer}
        {score !== undefined ? (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreIcon}>♪</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
        ) : null}
      </View>

      {showPause ? (
        <ExercisePauseOverlay
          visible={paused}
          onResume={closePause}
          onRestart={() => {
            closePause();
            onRestartSession?.();
          }}
          onExitToLessonMenu={() => {
            closePause();
            onExitToLessonMenu?.();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2B2B2B',
  },
  pauseButton: {
    position: 'absolute',
    zIndex: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  topChrome: {
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  controlPlaceholder: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  lessonTitle: {
    fontFamily: fonts.title,
    fontSize: exerciseSessionTitleType.fontSize,
    lineHeight: exerciseSessionTitleType.lineHeight,
    letterSpacing: exerciseSessionTitleType.letterSpacing,
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
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hintLandscape: {
    fontSize: fontSizes.xs,
  },
  band: {
    backgroundColor: '#383838',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
