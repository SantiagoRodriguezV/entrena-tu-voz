import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { MicPermissionStatus } from '../types/vocalAnalysis';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type PreparationStepProps = {
  micPermission: MicPermissionStatus;
  onRequestMic: () => void;
  onStartExercise: () => void;
  onBack: () => void;
};

const INSTRUCTIONS = [
  'Busca un lugar cómodo',
  'Usa una intensidad moderada',
  'Detente si aparece dolor o irritación',
  'Realiza una sirena suave desde una zona grave hacia una más aguda',
];

export function PreparationStep({
  micPermission,
  onRequestMic,
  onStartExercise,
  onBack,
}: PreparationStepProps) {
  const canStart = micPermission === 'granted';

  return (
    <ScreenLayout>
      <Text style={styles.title}>Preparación</Text>
      <Text style={styles.subtitle}>
        Antes de comenzar, revisa estas indicaciones:
      </Text>

      <View style={styles.list}>
        {INSTRUCTIONS.map((item, index) => (
          <View key={item} style={styles.listItem}>
            <View style={styles.bullet}>
              <Text style={styles.bulletText}>{index + 1}</Text>
            </View>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.permissionCard}>
        <Text style={styles.permissionTitle}>Permiso de micrófono</Text>
        <PermissionStatus status={micPermission} />
        {micPermission !== 'granted' && (
          <PrimaryButton
            label={
              micPermission === 'denied'
                ? 'Permiso rechazado — simular concesión (demo)'
                : 'Solicitar permiso de micrófono'
            }
            onPress={onRequestMic}
            variant="secondary"
          />
        )}
        {micPermission === 'denied' && (
          <Text style={styles.demoNote}>
            En esta versión demo puedes simular la concesión. En la iteración 2 se
            usará el micrófono real.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Comenzar ejercicio"
          onPress={onStartExercise}
          disabled={!canStart}
        />
        <View style={styles.spacer} />
        <PrimaryButton label="Volver" onPress={onBack} variant="outline" />
      </View>
    </ScreenLayout>
  );
}

function PermissionStatus({ status }: { status: MicPermissionStatus }) {
  const config = {
    undetermined: {
      label: 'Sin solicitar',
      color: colors.textMuted,
      icon: '○',
    },
    granted: {
      label: 'Permiso concedido',
      color: colors.accent,
      icon: '●',
    },
    denied: {
      label: 'Permiso rechazado',
      color: colors.primary,
      icon: '✕',
    },
  }[status];

  return (
    <View style={styles.statusRow} accessibilityLabel={`Estado: ${config.label}`}>
      <Text style={[styles.statusIcon, { color: config.color }]}>{config.icon}</Text>
      <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.light,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  demoNote: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
  },
  spacer: {
    height: spacing.sm,
  },
});
