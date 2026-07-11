import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isSungFrame } from '../audio/evaluation/sungFrame';
import {
  createVocalCalibration,
  median,
  UserVocalCalibration,
} from '../audio/userVocalProfile';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { VocalFrame } from '../types/exercise';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type CalibrationStep = 'comfort' | 'lower' | 'higher' | 'confirm';

type VocalCalibrationScreenProps = {
  vocalFrame: VocalFrame | null;
  micReady: boolean;
  onComplete: (calibration: UserVocalCalibration) => void;
  onSkip?: () => void;
  onBack?: () => void;
};

const CAPTURE_SUNG_MS = 1200;
const TICK_MS = 50;
const MIN_SAMPLES = 8;

const STEP_COPY: Record<
  Exclude<CalibrationStep, 'confirm'>,
  { title: string; hint: string }
> = {
  comfort: {
    title: 'Canta una nota cómoda',
    hint: 'Sostén una nota natural, sin forzar, durante un segundo.',
  },
  lower: {
    title: 'Canta un poco más grave',
    hint: 'Baja un poco desde tu nota cómoda y sostén.',
  },
  higher: {
    title: 'Canta un poco más aguda',
    hint: 'Sube un poco desde tu nota cómoda y sostén.',
  },
};

export function VocalCalibrationScreen({
  vocalFrame,
  micReady,
  onComplete,
  onSkip,
  onBack,
}: VocalCalibrationScreenProps) {
  const [step, setStep] = useState<CalibrationStep>('comfort');
  const [progress, setProgress] = useState(0);
  const [comfortHz, setComfortHz] = useState<number | null>(null);
  const [lowerHz, setLowerHz] = useState<number | null>(null);
  const [higherHz, setHigherHz] = useState<number | null>(null);
  const [comfortDb, setComfortDb] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);

  const hzSamplesRef = useRef<number[]>([]);
  const dbSamplesRef = useRef<number[]>([]);
  const sungMsRef = useRef(0);
  const frameRef = useRef(vocalFrame);

  useEffect(() => {
    frameRef.current = vocalFrame;
  }, [vocalFrame]);

  const resetCapture = useCallback(() => {
    hzSamplesRef.current = [];
    dbSamplesRef.current = [];
    sungMsRef.current = 0;
    setProgress(0);
    setCapturing(false);
  }, []);

  useEffect(() => {
    if (step === 'confirm') return;
    resetCapture();
  }, [step, resetCapture]);

  useEffect(() => {
    if (!micReady || step === 'confirm') return;

    const interval = setInterval(() => {
      const frame = frameRef.current;
      if (!frame || !isSungFrame(frame)) {
        if (sungMsRef.current > 0 && sungMsRef.current < CAPTURE_SUNG_MS) {
          // Soft reset if user stops mid-capture
          hzSamplesRef.current = [];
          dbSamplesRef.current = [];
          sungMsRef.current = 0;
          setProgress(0);
          setCapturing(false);
        }
        return;
      }

      const hz = frame.rawHz;
      if (hz === null || hz <= 0) return;

      setCapturing(true);
      hzSamplesRef.current.push(hz);
      const db = frame.relativeDb ?? frame.volumeDb;
      if (db !== null) dbSamplesRef.current.push(db);

      sungMsRef.current += TICK_MS;
      setProgress(Math.min(1, sungMsRef.current / CAPTURE_SUNG_MS));

      if (
        sungMsRef.current >= CAPTURE_SUNG_MS &&
        hzSamplesRef.current.length >= MIN_SAMPLES
      ) {
        const hzMed = median(hzSamplesRef.current);
        const dbMed = median(dbSamplesRef.current);

        if (step === 'comfort') {
          setComfortHz(hzMed);
          setComfortDb(dbMed);
          setStep('lower');
        } else if (step === 'lower') {
          setLowerHz(hzMed);
          setStep('higher');
        } else if (step === 'higher') {
          setHigherHz(hzMed);
          setStep('confirm');
        }
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [micReady, step]);

  const handleConfirm = useCallback(() => {
    if (
      comfortHz === null ||
      lowerHz === null ||
      higherHz === null ||
      comfortDb === null
    ) {
      return;
    }
    onComplete(
      createVocalCalibration({
        comfortHz,
        lowerHz,
        higherHz,
        comfortDb,
      }),
    );
  }, [comfortDb, comfortHz, higherHz, lowerHz, onComplete]);

  if (!micReady) {
    return (
      <ScreenLayout variant="dark">
        <View style={styles.center}>
          <Text style={styles.title}>Preparando micrófono…</Text>
          <Text style={styles.hint}>
            Necesitamos el micrófono para calibrar tu zona cómoda.
          </Text>
          {onBack ? (
            <PrimaryButton label="Volver" onPress={onBack} variant="outline" />
          ) : null}
        </View>
      </ScreenLayout>
    );
  }

  if (step === 'confirm') {
    return (
      <ScreenLayout variant="dark">
        <View style={styles.center}>
          <Text style={styles.title}>Calibración lista</Text>
          <Text style={styles.hint}>
            Usaremos tu zona cómoda para los ejercicios. Puedes recalibrar desde
            Ajustes.
          </Text>
          <View style={styles.summary}>
            <Text style={styles.summaryLine}>
              Cómoda: {comfortHz?.toFixed(0)} Hz
            </Text>
            <Text style={styles.summaryLine}>
              Grave: {lowerHz?.toFixed(0)} Hz · Aguda: {higherHz?.toFixed(0)} Hz
            </Text>
          </View>
          <PrimaryButton label="Continuar" onPress={handleConfirm} />
        </View>
      </ScreenLayout>
    );
  }

  const copy = STEP_COPY[step];
  const stepIndex = step === 'comfort' ? 1 : step === 'lower' ? 2 : 3;

  return (
    <ScreenLayout variant="dark">
      <View style={styles.center}>
        <Text style={styles.stepLabel}>Paso {stepIndex} de 3</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.hint}>{copy.hint}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.status}>
          {capturing ? 'Escuchando…' : 'Esperando tu voz'}
        </Text>

        {onSkip ? (
          <PrimaryButton
            label="Omitir por ahora"
            onPress={onSkip}
            variant="outline"
            style={styles.skip}
          />
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.light,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressTrack: {
    width: '80%',
    maxWidth: 280,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  status: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  summary: {
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  summaryLine: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.light,
    textAlign: 'center',
  },
  skip: {
    marginTop: spacing.xl,
  },
});
