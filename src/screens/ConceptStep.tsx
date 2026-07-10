import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { VocalPathAnimation } from '../components/VocalPathAnimation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ConceptStepProps = {
  onContinue: () => void;
  onBack: () => void;
};

export function ConceptStep({ onContinue, onBack }: ConceptStepProps) {
  return (
    <ScreenLayout>
      <Text style={styles.title}>¿Qué es el cambio de registro?</Text>
      <Text style={styles.body}>
        Al subir o bajar de altura, la voz reorganiza su coordinación. El objetivo
        no es empujar el sonido, sino permitir una transición progresiva.
      </Text>

      <View style={styles.visualCard}>
        <Text style={styles.visualLabel}>Grave</Text>
        <VocalPathAnimation progress={1} showDot={false} />
        <Text style={styles.visualLabelAgudo}>Agudo</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Ver ejercicio" onPress={onContinue} />
        <View style={styles.spacer} />
        <PrimaryButton label="Volver" onPress={onBack} variant="outline" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  visualCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visualLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  visualLabelAgudo: {
    alignSelf: 'flex-end',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
  },
  spacer: {
    height: spacing.sm,
  },
});
