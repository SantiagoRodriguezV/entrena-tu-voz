import { StyleSheet, Text, View } from 'react-native';
import { feedbackByResult } from '../coach/feedbackMessages';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { BasicAudioMetrics, VocalAnalysisResult } from '../types/vocalAnalysis';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type FeedbackStepProps = {
  analysis: VocalAnalysisResult;
  basicMetrics?: BasicAudioMetrics;
  onRepeat: () => void;
  onContinue: () => void;
};

export function FeedbackStep({
  analysis,
  basicMetrics,
  onRepeat,
  onContinue,
}: FeedbackStepProps) {
  const content = feedbackByResult[analysis.resultType];

  return (
    <ScreenLayout>
      <Text style={styles.title}>{content.title}</Text>

      {content.indicators && (
        <View style={styles.indicators}>
          {content.indicators.map((item) => (
            <View key={item.label} style={styles.indicatorRow}>
              <Text style={styles.indicatorLabel}>{item.label}</Text>
              <Text style={styles.indicatorValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.messageCard}>
        <Text style={styles.message}>{content.message}</Text>
      </View>

      {basicMetrics && (
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Datos básicos (demo)</Text>
          <MetricRow
            label="Voz detectada"
            value={basicMetrics.voiceDetected ? 'Sí' : 'No'}
          />
          <MetricRow
            label="Duración"
            value={`${(basicMetrics.completedDuration / 1000).toFixed(1)} s`}
          />
          <MetricRow
            label="Nivel promedio"
            value={`${Math.round(basicMetrics.averageInputLevel * 100)}%`}
          />
        </View>
      )}

      <Text style={styles.disclaimer}>
        Este feedback describe proximidad al patrón esperado. No evalúa salud vocal
        ni coordinación fisiológica.
      </Text>

      <View style={styles.footer}>
        <PrimaryButton label="Repetir ejercicio" onPress={onRepeat} variant="outline" />
        <View style={styles.spacer} />
        <PrimaryButton label="Continuar" onPress={onContinue} />
      </View>
    </ScreenLayout>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  indicators: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  indicatorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  messageCard: {
    backgroundColor: colors.secondary + '18',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  metricsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  metricsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  footer: {
    marginTop: 'auto',
  },
  spacer: {
    height: spacing.sm,
  },
});
