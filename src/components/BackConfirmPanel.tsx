import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PillActionButton } from './PillActionButton';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type BackConfirmPanelProps = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
};

export function BackConfirmPanel({ visible, onDismiss, onConfirm }: BackConfirmPanelProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>¿Seguro que quieres volver atrás?</Text>
          <Text style={styles.body}>
            Perderás el progreso de la sesión actual en esta pantalla.
          </Text>
          <PillActionButton
            variant="continue"
            onPress={() => {
              onDismiss();
              onConfirm();
            }}
            accessibilityLabel="Continuar"
          />
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
    borderColor: '#0D6E74',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.light,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
