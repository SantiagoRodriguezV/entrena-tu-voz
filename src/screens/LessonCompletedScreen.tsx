import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RockHandTurq from '../../assets/icons/rock-hand-turq.svg';
import { UserProgress } from '../audio/xpSystem';
import { AppIcon } from '../components/AppIcon';
import { ExperienceBar } from '../components/ExperienceBar';
import { PillActionButton } from '../components/PillActionButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, palette } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type LessonCompletedScreenProps = {
  totalXpEarned: number;
  highAccuracyNotes: number;
  totalNotes: number;
  progressBefore: UserProgress;
  progressAfter: UserProgress;
  onRepeat: () => void;
  onContinue: () => void;
};

export function LessonCompletedScreen({
  totalXpEarned,
  highAccuracyNotes,
  totalNotes,
  progressBefore,
  progressAfter,
  onRepeat,
  onContinue,
}: LessonCompletedScreenProps) {
  const headerXp = useMemo(() => progressAfter.totalXp, [progressAfter.totalXp]);

  return (
    <ScreenLayout variant="completion" scrollable={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <AppIcon icon={RockHandTurq} size={48} />
          <Text style={styles.headerXp}>{headerXp}</Text>
        </View>

        <Text style={styles.title}>¡LECCIÓN{'\n'}COMPLETADA!</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              + {totalXpEarned}
              <Text style={styles.statXpSuffix}> XP</Text>
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {highAccuracyNotes} / {totalNotes}
            </Text>
          </View>
        </View>

        <ExperienceBar
          progressBefore={progressBefore}
          progressAfter={progressAfter}
          earnedXp={totalXpEarned}
          animate
        />

        <View style={styles.footer}>
          <View style={styles.halfButton}>
            <PillActionButton
              variant="repeat"
              onPress={onRepeat}
              accessibilityLabel="Repetir"
            />
          </View>
          <View style={styles.halfButton}>
            <PillActionButton
              variant="continue"
              onPress={onContinue}
              accessibilityLabel="Continuar"
            />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  headerXp: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: colors.light,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.light,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 36,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    borderWidth: 3,
    borderColor: palette.turqShadeMain,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.light,
    textAlign: 'center',
  },
  statXpSuffix: {
    fontSize: fontSizes.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
});
