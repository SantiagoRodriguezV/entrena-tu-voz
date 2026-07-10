import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type PitchZone = {
  id: string;
  targetHz: number;
  startProgress: number;
  endProgress: number;
};

const PITCH_ZONES: PitchZone[] = [
  { id: 'z1', targetHz: 180, startProgress: 0, endProgress: 0.25 },
  { id: 'z2', targetHz: 260, startProgress: 0.25, endProgress: 0.5 },
  { id: 'z3', targetHz: 340, startProgress: 0.5, endProgress: 0.75 },
  { id: 'z4', targetHz: 420, startProgress: 0.75, endProgress: 1 },
];

type PitchScrollProps = {
  currentHz: number;
  exerciseProgress: number;
};

function isNearTarget(currentHz: number, targetHz: number): boolean {
  return Math.abs(currentHz - targetHz) <= 35;
}

function isInZone(progress: number, zone: PitchZone): boolean {
  return progress >= zone.startProgress && progress <= zone.endProgress;
}

export function PitchScroll({ currentHz, exerciseProgress }: PitchScrollProps) {
  const trackHeight = 120;

  const normalizedPosition = Math.max(
    0,
    Math.min(1, (currentHz - 150) / (450 - 150)),
  );
  const ballTop = trackHeight - normalizedPosition * (trackHeight - 20) - 10;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Altura (Hz)</Text>
      <View style={styles.scrollContainer}>
        <View style={[styles.track, { height: trackHeight }]}>
          {PITCH_ZONES.map((zone) => {
            const filled =
              isInZone(exerciseProgress, zone) &&
              isNearTarget(currentHz, zone.targetHz);
            const zoneTop =
              trackHeight -
              ((zone.targetHz - 150) / (450 - 150)) * (trackHeight - 30) -
              15;

            return (
              <View
                key={zone.id}
                style={[
                  styles.zone,
                  { top: zoneTop },
                  filled && styles.zoneFilled,
                ]}
              >
                <Text style={[styles.zoneLabel, filled && styles.zoneLabelFilled]}>
                  {zone.targetHz}
                </Text>
              </View>
            );
          })}
          <View style={[styles.ball, { top: ballTop }]} />
        </View>
        <Text style={styles.hzValue}>{Math.round(currentHz)} Hz</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  track: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  zone: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  zoneLabel: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },
  zoneLabelFilled: {
    color: '#FFFFFF',
  },
  ball: {
    position: 'absolute',
    right: spacing.md,
    width: 16,
    height: 16,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  hzValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light,
    minWidth: 60,
  },
});
