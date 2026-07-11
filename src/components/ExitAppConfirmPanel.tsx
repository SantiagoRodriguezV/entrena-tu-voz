import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, palette } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type ExitAppConfirmPanelProps = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
};

export function ExitAppConfirmPanel({
  visible,
  onDismiss,
  onConfirm,
}: ExitAppConfirmPanelProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>
            ¿Estás seguro que quieres salir de{' '}
            <Text style={styles.brand}>Scream.io</Text>?
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onDismiss();
                onConfirm();
              }}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Salir"
            >
              <Text style={styles.primaryLabel}>Salir</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: palette.turqShadeMain,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.light,
    textAlign: 'center',
    lineHeight: 28,
  },
  brand: {
    color: palette.red,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: palette.dark60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryLabel: {
    fontFamily: fonts.title,
    fontSize: fontSizes.sm,
    color: colors.light,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: borderRadius.md,
    backgroundColor: palette.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryLabel: {
    fontFamily: fonts.title,
    fontSize: fontSizes.sm,
    color: colors.light,
  },
  pressed: {
    opacity: 0.88,
  },
});
