import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { audioThresholds } from '../audio/audioThresholds';
import { AudioLevelMeter } from '../components/AudioLevelMeter';
import { ExerciseTimeProgress } from '../components/ExerciseTimeProgress';
import { PitchScroll } from '../components/PitchScroll';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { VocalPathAnimation } from '../components/VocalPathAnimation';
import { VolumeBar } from '../components/VolumeBar';
import { BasicAudioMetrics } from '../types/vocalAnalysis';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ExercisePhase = 'countdown' | 'recording' | 'done';

type ExerciseStepProps = {
  onComplete: (metrics: BasicAudioMetrics) => void;
  onCancel: () => void;
};

const EXERCISE_MS = audioThresholds.exerciseDurationSeconds * 1000;
const COUNTDOWN_MS = audioThresholds.countdownSeconds * 1000;

function simulateLevel(elapsedMs: number): number {
  const wave = Math.sin(elapsedMs / 180) * 0.12;
  const base = 0.45 + (elapsedMs / EXERCISE_MS) * 0.15;
  return Math.max(0.1, Math.min(0.95, base + wave));
}

function simulateHz(elapsedMs: number): number {
  const progress = elapsedMs / EXERCISE_MS;
  return 160 + progress * 260 + Math.sin(elapsedMs / 220) * 12;
}

function simulateDb(elapsedMs: number): number {
  const progress = elapsedMs / EXERCISE_MS;
  return 62 + progress * 12 + Math.sin(elapsedMs / 300) * 4;
}

export function ExerciseStep({ onComplete, onCancel }: ExerciseStepProps) {
  const [phase, setPhase] = useState<ExercisePhase>('countdown');
  const [countdown, setCountdown] = useState(audioThresholds.countdownSeconds);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentHz, setCurrentHz] = useState(160);
  const [currentDb, setCurrentDb] = useState(62);
  const [isListening, setIsListening] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const finishExercise = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('done');
    setIsListening(false);

    const metrics: BasicAudioMetrics = {
      voiceDetected: true,
      completedDuration: EXERCISE_MS,
      averageInputLevel: 0.52,
      hadLongSilences: false,
      exerciseDurationMs: EXERCISE_MS,
    };
    onComplete(metrics);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'countdown') return;

    const countdownStart = Date.now();
    const interval = setInterval(() => {
      const remaining = COUNTDOWN_MS - (Date.now() - countdownStart);
      const secondsLeft = Math.ceil(remaining / 1000);
      setCountdown(Math.max(0, secondsLeft));

      if (remaining <= 0) {
        clearInterval(interval);
        setPhase('recording');
        setIsListening(true);
        startTimeRef.current = Date.now();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'recording') return;

    const interval = setInterval(() => {
      const start = startTimeRef.current ?? Date.now();
      const elapsed = Date.now() - start;
      setElapsedMs(elapsed);
      setAudioLevel(simulateLevel(elapsed));
      setCurrentHz(simulateHz(elapsed));
      setCurrentDb(simulateDb(elapsed));

      if (elapsed >= EXERCISE_MS) {
        clearInterval(interval);
        finishExercise();
      }
    }, 80);

    return () => clearInterval(interval);
  }, [phase, finishExercise]);

  const exerciseProgress =
    phase === 'recording' ? Math.min(1, elapsedMs / EXERCISE_MS) : 0;
  const remainingSeconds = Math.max(
    0,
    Math.ceil((EXERCISE_MS - elapsedMs) / 1000),
  );

  return (
    <ScreenLayout scrollable>
      {phase === 'countdown' ? (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownNumber}>{countdown || '¡Vamos!'}</Text>
          <Text style={styles.countdownHint}>Prepárate para la sirena</Text>
        </View>
      ) : (
        <>
          <Text style={styles.instruction}>
            Sigue la trayectoria con una sirena suave
          </Text>

          <ExerciseTimeProgress progress={exerciseProgress} />

          <View style={styles.pathContainer}>
            <VocalPathAnimation progress={exerciseProgress} />
          </View>

          <View style={styles.metricsSection}>
            <PitchScroll currentHz={currentHz} exerciseProgress={exerciseProgress} />
            <VolumeBar decibels={currentDb} />
            <View style={styles.meterBlock}>
              <Text style={styles.meterLabel}>
                Entrada de audio {isListening ? '(simulada — iteración 1)' : ''}
              </Text>
              <AudioLevelMeter level={audioLevel} isSimulated />
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isListening && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {isListening ? 'Escuchando…' : 'Finalizando…'}
            </Text>
            <Text style={styles.timer}>{remainingSeconds}s</Text>
          </View>
        </>
      )}

      {phase !== 'done' && (
        <View style={styles.footer}>
          <PrimaryButton
            label="Cancelar"
            onPress={onCancel}
            variant="outline"
          />
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: '700',
    color: colors.primary,
  },
  countdownHint: {
    fontSize: 17,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  instruction: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  pathContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  metricsSection: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  meterBlock: {
    gap: spacing.sm,
  },
  meterLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.micInactive,
  },
  statusDotActive: {
    backgroundColor: colors.micActive,
  },
  statusText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
