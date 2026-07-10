import { RefObject } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnchoredInfoPanel } from './AnchoredInfoPanel';
import { StreakCalendar } from './StreakCalendar';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { useResponsive } from '../theme/responsive';

type StreakPanelProps = {
  visible: boolean;
  anchorRef: RefObject<View | null>;
  streakCount: number;
  exerciseDates: string[];
  onDismiss: () => void;
};

const STREAK_VALUE_COLOR = '#DD475B';

export function StreakPanel({
  visible,
  anchorRef,
  streakCount,
  exerciseDates,
  onDismiss,
}: StreakPanelProps) {
  const { moderateScale } = useResponsive();

  return (
    <AnchoredInfoPanel
      visible={visible}
      title="Racha"
      anchorRef={anchorRef}
      onDismiss={onDismiss}
      panelWidth={moderateScale(300)}
    >
      <View style={styles.streakRow}>
        <Text style={styles.streakValue}>{streakCount}</Text>
        <Text style={styles.streakLabel}>días seguidos</Text>
      </View>
      <StreakCalendar exerciseDates={exerciseDates} />
    </AnchoredInfoPanel>
  );
}

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  streakValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: STREAK_VALUE_COLOR,
  },
  streakLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
