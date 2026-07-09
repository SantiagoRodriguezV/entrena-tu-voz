import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { audioThresholds } from '../audio/audioThresholds';

type VolumeBarProps = {
  decibels: number;
};

export function VolumeBar({ decibels }: VolumeBarProps) {
  const minDb = 40;
  const maxDb = 100;
  const clamped = Math.max(minDb, Math.min(maxDb, decibels));
  const fillPercent = ((clamped - minDb) / (maxDb - minDb)) * 100;
  const isLoud = decibels >= audioThresholds.loudVolumeDb;
  const barColor = isLoud ? colors.primary : colors.accent;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>Intensidad</Text>
        <Text style={[styles.value, isLoud && styles.valueLoud]}>
          {Math.round(decibels)} dB
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${fillPercent}%`, backgroundColor: barColor },
          ]}
        />
        <View
          style={[
            styles.thresholdMarker,
            {
              left: `${((audioThresholds.loudVolumeDb - minDb) / (maxDb - minDb)) * 100}%`,
            },
          ]}
        />
      </View>
      {isLoud && (
        <Text style={styles.warning} accessibilityRole="alert">
          Intensidad alta — modera el volumen
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  valueLoud: {
    color: colors.primary,
  },
  track: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  warning: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.primary,
  },
});
