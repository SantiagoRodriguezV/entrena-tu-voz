import { Modal, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.title}>Ajustes</Text>
          <Text style={styles.body}>
            Demo académica v2.0. El micrófono y la detección de altura funcionan en
            tiempo real con un development build de Android.
          </Text>
          <Text style={styles.note}>
            El volumen mostrado es un nivel relativo aproximado (dBFS), no una medición
            clínica ni calibrada en dB SPL.
          </Text>
          <Text style={styles.note}>
            Para instalar en tu teléfono: conecta el dispositivo y ejecuta{' '}
            <Text style={styles.code}>npx expo run:android</Text>
          </Text>
          <PrimaryButton label="Cerrar" onPress={onClose} variant="outline" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.light,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  code: {
    fontFamily: fonts.body,
    color: colors.secondary,
  },
});
