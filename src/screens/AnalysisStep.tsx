import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type AnalysisStepProps = {
  onFinished: () => void;
};

const ANALYSIS_STEPS = [
  'Escuchando la emisión',
  'Comparando con el recorrido',
  'Preparando feedback',
];

export function AnalysisStep({ onFinished }: AnalysisStepProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveIndex((prev) => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
    }, 650);

    const finishTimeout = setTimeout(() => {
      onFinished();
    }, 2000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(finishTimeout);
    };
  }, [onFinished]);

  return (
    <ScreenLayout scrollable={false}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.title}>Analizando tu ejecución</Text>
        <Text style={styles.subtitle}>
          Esto es representativo — no usa servicios externos
        </Text>
        <ProgressIndicator steps={ANALYSIS_STEPS} activeIndex={activeIndex} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
