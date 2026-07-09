import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  aggregateExerciseAccuracy,
  countCorrectNotes,
  getColorFromAccuracy,
  getLiveAccuracyPercent,
  getPitchAccuracyPercent,
  PAUSE_ACCURACY_THRESHOLD,
} from '../audio/accuracyUtils';
import { scoreNotePerformance } from '../audio/exerciseScoring';
import {
  applyHorizontalSnap,
  applyPitchSnap,
  getCentsError,
  getCurrentTargetNote,
  getMinMaxHz,
  hzToY,
  isWithinNote,
} from '../audio/pitchUtils';
import { getLessonExerciseDuration } from '../data/lessonExercises';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { VoiceIndicator } from '../components/VoiceIndicator';
import { WarmupExerciseShell } from '../components/warmup/WarmupExerciseShell';
import {
  WARMUP_LANE_HEIGHT,
  WARMUP_PLAYHEAD_X,
  WARMUP_PIXELS_PER_MS,
  WarmupNoteStaircase,
  getWarmupScrollLayout,
  warmupTimeToX,
} from '../components/warmup/WarmupNoteStaircase';
import { ExerciseNote, NotePerformance, VocalFrame } from '../types/exercise';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type VocalExerciseScreenProps = {
  exerciseIndex: number;
  lessonTitle: string;
  vowelLabel: string;
  notes: ExerciseNote[];
  onComplete: (result: {
    performances: NotePerformance[];
    accuracyPercent: number;
    correctNotes: number;
    totalNotes: number;
  }) => void;
  onCancel: () => void;
  vocalFrame: VocalFrame | null;
  micReady: boolean;
};

const TICK_MS = 50;
const INDICATOR_SIZE = 14;

export function VocalExerciseScreen({
  exerciseIndex,
  lessonTitle,
  vowelLabel,
  notes,
  onComplete,
  onCancel,
  vocalFrame,
  micReady,
}: VocalExerciseScreenProps) {
  const exerciseDurationMs = getLessonExerciseDuration(exerciseIndex - 1);

  const [timeMs, setTimeMs] = useState(0);
  const [pauseMessage, setPauseMessage] = useState<string | null>(null);
  const [indicatorColor, setIndicatorColor] = useState<string>(colors.secondary);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id ?? null);
  const [liveScore, setLiveScore] = useState(0);

  const timeMsRef = useRef(0);
  const framesRef = useRef<VocalFrame[]>([]);
  const scoredNotesRef = useRef<Set<string>>(new Set());
  const performancesRef = useRef<NotePerformance[]>([]);
  const completedRef = useRef(false);
  const noteActiveMsRef = useRef<Record<string, number>>({});
  const vocalFrameRef = useRef(vocalFrame);
  const wasVoiceActiveRef = useRef(false);
  const holdingAtEndRef = useRef<string | null>(null);
  const heldPastEndMsRef = useRef<Record<string, number>>({});

  const { minHz, maxHz } = getMinMaxHz(notes);

  const indicatorX = useSharedValue(WARMUP_PLAYHEAD_X);
  const indicatorY = useSharedValue(WARMUP_LANE_HEIGHT / 2);
  const indicatorOpacity = useSharedValue(1);

  const updateIndicatorVisuals = useCallback(
    (
      frame: VocalFrame,
      targetNote: ExerciseNote | null,
      currentTime: number,
      accuracy: number,
    ) => {
      if (!targetNote) return;

      const layout = getWarmupScrollLayout(targetNote, minHz, maxHz);
      setIndicatorColor(getColorFromAccuracy(accuracy));

      if (frame.isVoiceActive && frame.detectedHz !== null) {
        const snappedHz = applyPitchSnap(frame.detectedHz, targetNote.targetHz);
        const snappedTime = applyHorizontalSnap(currentTime, targetNote);
        const scrollOffset = currentTime * WARMUP_PIXELS_PER_MS - WARMUP_PLAYHEAD_X;
        const targetX = warmupTimeToX(snappedTime) - scrollOffset;
        const targetY = hzToY(snappedHz, minHz, maxHz, WARMUP_LANE_HEIGHT);

        indicatorX.value = withTiming(targetX, {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorY.value = withTiming(targetY, {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorOpacity.value = withTiming(1, { duration: 200 });
      } else {
        indicatorX.value = withTiming(WARMUP_PLAYHEAD_X, {
          duration: 280,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorY.value = withTiming(layout.centerY, {
          duration: 280,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorOpacity.value = withTiming(0.35, { duration: 280 });
      }
    },
    [indicatorOpacity, indicatorX, indicatorY, minHz, maxHz],
  );

  useEffect(() => {
    vocalFrameRef.current = vocalFrame;
  }, [vocalFrame]);

  useEffect(() => {
    timeMsRef.current = 0;
    framesRef.current = [];
    scoredNotesRef.current = new Set();
    performancesRef.current = [];
    noteActiveMsRef.current = {};
    heldPastEndMsRef.current = {};
    holdingAtEndRef.current = null;
    wasVoiceActiveRef.current = false;
    completedRef.current = false;
    setTimeMs(0);
    setPauseMessage(null);
    setLiveScore(0);

    const interval = setInterval(() => {
      if (completedRef.current) return;

      let currentTime = timeMsRef.current;
      const frame = vocalFrameRef.current ?? {
        timeMs: currentTime,
        detectedHz: null,
        volumeDb: null,
        volumeCategory: 'low' as const,
        isVoiceActive: false,
      };

      const frameWithTime = { ...frame, timeMs: currentTime };
      framesRef.current.push(frameWithTime);

      const targetNote = getCurrentTargetNote(currentTime, notes);
      setActiveNoteId(targetNote?.id ?? null);

      let accuracy = 0;
      let shouldAdvanceTime = true;

      if (targetNote) {
        const noteId = targetNote.id;
        const noteEnd = targetNote.startMs + targetNote.durationMs;

        if (
          wasVoiceActiveRef.current &&
          !frame.isVoiceActive &&
          isWithinNote(currentTime, targetNote) &&
          !scoredNotesRef.current.has(noteId)
        ) {
          timeMsRef.current = targetNote.startMs;
          setTimeMs(targetNote.startMs);
          noteActiveMsRef.current[noteId] = 0;
          holdingAtEndRef.current = null;
          currentTime = targetNote.startMs;
        }

        if (frame.isVoiceActive) {
          noteActiveMsRef.current[noteId] =
            (noteActiveMsRef.current[noteId] ?? 0) + TICK_MS;
        }

        const heldRatio = Math.min(
          1,
          (noteActiveMsRef.current[noteId] ?? 0) / targetNote.durationMs,
        );
        accuracy = getLiveAccuracyPercent(frameWithTime, targetNote, heldRatio);

        const pitchPercent =
          frame.detectedHz !== null && frame.isVoiceActive
            ? getPitchAccuracyPercent(
                getCentsError(frame.detectedHz, targetNote.targetHz),
              )
            : 0;

        if (currentTime >= noteEnd && !scoredNotesRef.current.has(noteId)) {
          if (pitchPercent < PAUSE_ACCURACY_THRESHOLD) {
            holdingAtEndRef.current = noteId;
            heldPastEndMsRef.current[noteId] =
              (heldPastEndMsRef.current[noteId] ?? 0) + TICK_MS;
            timeMsRef.current = noteEnd;
            setTimeMs(noteEnd);
            shouldAdvanceTime = false;
            setPauseMessage('Alcanza la nota para continuar');
          } else if (frame.isVoiceActive) {
            scoredNotesRef.current.add(noteId);
            holdingAtEndRef.current = null;
            const performance = scoreNotePerformance(framesRef.current, targetNote, {
              heldPastEndMs: heldPastEndMsRef.current[noteId] ?? 0,
            });
            performancesRef.current.push(performance);
            setLiveScore(
              Math.round(aggregateExerciseAccuracy(performancesRef.current)),
            );
            setPauseMessage(null);
          } else {
            holdingAtEndRef.current = noteId;
            heldPastEndMsRef.current[noteId] =
              (heldPastEndMsRef.current[noteId] ?? 0) + TICK_MS;
            timeMsRef.current = noteEnd;
            setTimeMs(noteEnd);
            shouldAdvanceTime = false;
            setPauseMessage('Alcanza la nota para continuar');
          }
        } else if (holdingAtEndRef.current === noteId) {
          shouldAdvanceTime = false;
        } else {
          setPauseMessage(null);
        }
      }

      wasVoiceActiveRef.current = frame.isVoiceActive;
      updateIndicatorVisuals(frameWithTime, targetNote, currentTime, accuracy);

      if (shouldAdvanceTime && currentTime < exerciseDurationMs) {
        timeMsRef.current = currentTime + TICK_MS;
        setTimeMs(timeMsRef.current);
      } else if (
        (currentTime >= exerciseDurationMs ||
          performancesRef.current.length >= notes.length) &&
        !completedRef.current
      ) {
        completedRef.current = true;
        clearInterval(interval);

        for (const note of notes) {
          if (!scoredNotesRef.current.has(note.id)) {
            scoredNotesRef.current.add(note.id);
            performancesRef.current.push(
              scoreNotePerformance(framesRef.current, note, {
                heldPastEndMs: heldPastEndMsRef.current[note.id] ?? 0,
              }),
            );
          }
        }

        const perfs = performancesRef.current;
        onComplete({
          performances: perfs,
          accuracyPercent: aggregateExerciseAccuracy(perfs),
          correctNotes: countCorrectNotes(perfs),
          totalNotes: notes.length,
        });
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [exerciseIndex, notes, exerciseDurationMs, onComplete, updateIndicatorVisuals]);

  if (!micReady) {
    return (
      <ScreenLayout variant="dark">
        <Text style={styles.waitingTitle}>Preparando micrófono…</Text>
        <Text style={styles.waitingBody}>
          Usa un development build en Android (`npx expo run:android`) para detección
          vocal en tiempo real.
        </Text>
        <PrimaryButton label="Volver" onPress={onCancel} variant="outline" />
      </ScreenLayout>
    );
  }

  return (
    <WarmupExerciseShell
      lessonTitle={lessonTitle}
      vowelLabel={vowelLabel}
      hint={pauseMessage ?? `Ejercicio ${exerciseIndex} / 6`}
      score={liveScore}
      showPause
      onPause={onCancel}
    >
      <View style={styles.laneWrapper}>
        <WarmupNoteStaircase
          notes={notes}
          vowelLabel={vowelLabel}
          mode="scrolling"
          activeNoteId={activeNoteId}
          timeMs={timeMs}
          overlay={
            <VoiceIndicator
              size={INDICATOR_SIZE}
              color={indicatorColor}
              animatedX={indicatorX}
              animatedY={indicatorY}
              animatedOpacity={indicatorOpacity}
            />
          }
        />
      </View>
    </WarmupExerciseShell>
  );
}

const styles = StyleSheet.create({
  laneWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  waitingTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  waitingBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});
