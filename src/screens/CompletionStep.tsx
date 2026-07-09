import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type CompletionStepProps = {
  onGoHome: () => void;
};

export function CompletionStep({ onGoHome }: CompletionStepProps) {
  return (
    <ScreenLayout>
      <View style={styles.hero}>
        <Text style={styles.emoji} accessibilityLabel="Lección completada">
          ✓
        </Text>
        <Text style={styles.title}>Lección completada</Text>
        <Text style={styles.body}>
          Exploraste cómo cambia tu voz al recorrer distintas alturas.
        </Text>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.nextLabel}>Próxima etapa</Text>
        <Text style={styles.nextTitle}>
          Aplicar el cambio de registro en una vocalización
        </Text>
        <View style={styles.lockedBadge}>
          <Text style={styles.lockedText}>Bloqueada</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Volver al inicio" onPress={onGoHome} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    color: colors.secondary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nextCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.85,
    marginBottom: spacing.xl,
  },
  nextLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  lockedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
  },
});
