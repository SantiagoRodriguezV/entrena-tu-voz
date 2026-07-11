import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, palette } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { fonts, fontSizes } from '../../theme/typography';

type ExerciseSettingsPanelProps = {
  volume: number;
  onVolumeChange: (value: number) => void;
  onClose: () => void;
};

export function ExerciseSettingsPanel({
  volume,
  onVolumeChange,
  onClose,
}: ExerciseSettingsPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.sectionLabel}>Ajustar volumen</Text>
      <View style={styles.volumeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bajar volumen"
          onPress={() => onVolumeChange(Math.max(0, volume - 10))}
          style={({ pressed }) => [styles.volumeBtn, pressed && styles.pressed]}
        >
          <Text style={styles.volumeBtnText}>−</Text>
        </Pressable>
        <Text style={styles.volumeValue}>{volume}%</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subir volumen"
          onPress={() => onVolumeChange(Math.min(100, volume + 10))}
          style={({ pressed }) => [styles.volumeBtn, pressed && styles.pressed]}
        >
          <Text style={styles.volumeBtnText}>+</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.placeholderBtn, styles.disabled]} disabled>
        <Text style={styles.placeholderText}>Próximamente</Text>
      </Pressable>
      <Pressable style={[styles.placeholderBtn, styles.disabled]} disabled>
        <Text style={styles.placeholderText}>Próximamente</Text>
      </Pressable>

      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Cerrar ajustes"
      >
        <Text style={styles.closeText}>Cerrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: palette.turqShadeMain,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.light,
    textAlign: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  volumeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeBtnText: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.light,
  },
  volumeValue: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.secondary,
    minWidth: 64,
    textAlign: 'center',
  },
  placeholderBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  closeBtn: {
    marginTop: spacing.xs,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  closeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
