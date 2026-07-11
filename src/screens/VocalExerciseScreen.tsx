import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
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
import {
  decideCoachingMessage,
  getCoachingCopy,
} from '../audio/evaluation/coachDecision';
import { createEmptyVocalFrame } from '../audio/evaluation/emptyFrame';
import { enrichFrameForNote } from '../audio/evaluation/enrichFrame';
import { evaluateNote } from '../audio/evaluation/noteEvaluator';
import { getScoringHz, isSungFrame } from '../audio/evaluation/sungFrame';
import {
  getCentsError,
  getCurrentTargetNote,
  getDisplayPitchHz,
  getPitchRangeForDisplay,
  hzToY,
  isWithinNote,
} from '../audio/pitchUtils';
import { getLessonExerciseDuration } from '../data/lessonExercises';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { VoiceIndicator } from '../components/VoiceIndicator';
import { WarmupExerciseShell } from '../components/warmup/WarmupExerciseShell';
import { WarmupNoteStaircase } from '../components/warmup/WarmupNoteStaircase';
import {
  getExerciseBandMetrics,
  getExerciseNoteGridLayout,
  timeToGridPlayheadX,
} from '../theme/warmupLaneMetrics';
import { useResponsive } from '../theme/responsive';
import { ExerciseNote, NotePerformance, VocalFrame } from '../types/exercise';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type VocalExerciseScreenProps = {
  exerciseIndex: number;
  lessonTitle: string;
  vowelLabel: string;
  notes: ExerciseNote[];
  sessionScore?: number;
  /** Personal comfort level for relative volume; null = absolute fallback. */
  comfortDb?: number | null;
  onComplete: (result: {
    performances: NotePerformance[];
    accuracyPercent: number;
    correctNotes: number;
    totalNotes: number;
  }) => void;
  onCancel: () => void;
  onBack: () => void;
  onRestartSession: () => void;
  onExitToLessonMenu: () => void;
  vocalFrame: VocalFrame | null;
  micReady: boolean;
};

const TICK_MS = 50;
const INDICATOR_SIZE = 24;
const STABILITY_WINDOW = 12;

export function VocalExerciseScreen({
  exerciseIndex,
  lessonTitle,
  vowelLabel,
  notes,
  sessionScore = 0,
  comfortDb = null,
  onComplete,
  onCancel,
  onBack,
  onRestartSession,
  onExitToLessonMenu,
  vocalFrame,
  micReady,
}: VocalExerciseScreenProps) {
  const { width, height } = useResponsive();
  const band = useMemo(
    () => getExerciseBandMetrics(width, height),
    [width, height],
  );
  const cells = useMemo(
    () => getExerciseNoteGridLayout(notes, band),
    [notes, band],
  );
  const exerciseDurationMs = getLessonExerciseDuration(exerciseIndex - 1);

  const [timeMs, setTimeMs] = useState(0);
  const [coachHint, setCoachHint] = useState<string | null>(
    getCoachingCopy('keepGoing'),
  );
  const [indicatorColor, setIndicatorColor] = useState<string>(colors.secondary);
  const [activeNoteColor, setActiveNoteColor] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id ?? null);
  const [liveScore, setLiveScore] = useState(0);
  const pausedRef = useRef(false);

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
  const recentCentsRef = useRef<number[]>([]);

  const indicatorX = useSharedValue(band.gridOffsetX);
  const indicatorY = useSharedValue(band.bandHeight / 2);
  const indicatorOpacity = useSharedValue(1);

  useEffect(() => {
    indicatorX.value = band.gridOffsetX;
    indicatorY.value = band.bandHeight / 2;
  }, [indicatorX, indicatorY, band.bandHeight, band.gridOffsetX]);

  const updateIndicatorVisuals = useCallback(
    (
      frame: VocalFrame,
      targetNote: ExerciseNote | null,
      currentTime: number,
      accuracy: number,
    ) => {
      if (!targetNote) return;

      const cell = cells.find((c) => c.note.id === targetNote.id);
      const playheadX = timeToGridPlayheadX(currentTime, cells);
      const color = getColorFromAccuracy(accuracy);
      setIndicatorColor(color);
      setActiveNoteColor(isSungFrame(frame) ? color : null);

      if (isSungFrame(frame) && frame.detectedHz !== null) {
        const displayHz = getDisplayPitchHz(frame.detectedHz, targetNote.targetHz);
        const { minHz: displayMinHz, maxHz: displayMaxHz } = getPitchRangeForDisplay(
          notes,
          displayHz,
        );
        const targetY = hzToY(
          displayHz,
          displayMinHz,
          displayMaxHz,
          band.gridHeight,
        ) + band.gridOffsetY;

        indicatorX.value = withTiming(playheadX, {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorY.value = withTiming(targetY, {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorOpacity.value = withTiming(1, { duration: 200 });
      } else {
        indicatorX.value = withTiming(playheadX, {
          duration: 280,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorY.value = withTiming(cell?.centerY ?? band.bandHeight / 2, {
          duration: 280,
          easing: Easing.inOut(Easing.ease),
        });
        indicatorOpacity.value = withTiming(0.35, { duration: 280 });
      }
    },
    [band, cells, indicatorOpacity, indicatorX, indicatorY, notes],
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
    recentCentsRef.current = [];
    setTimeMs(0);
    setCoachHint(getCoachingCopy('keepGoing'));
    setLiveScore(0);
    setActiveNoteColor(null);

    const interval = setInterval(() => {
      if (completedRef.current) return;
      if (pausedRef.current) return;

      let currentTime = timeMsRef.current;
      const frame = vocalFrameRef.current ?? createEmptyVocalFrame(currentTime);
      const targetNote = getCurrentTargetNote(currentTime, notes);
      setActiveNoteId(targetNote?.id ?? null);

      const frameWithTime = { ...frame, timeMs: currentTime };
      framesRef.current.push(frameWithTime);

      const enriched = enrichFrameForNote(frameWithTime, targetNote, {
        comfortDb,
      });

      if (enriched.pitchErrorCents !== null && isSungFrame(frame)) {
        recentCentsRef.current.push(Math.abs(enriched.pitchErrorCents));
        if (recentCentsRef.current.length > STABILITY_WINDOW) {
          recentCentsRef.current.shift();
        }
      } else if (!isSungFrame(frame)) {
        recentCentsRef.current = [];
      }

      let liveStability: number | null = null;
      if (recentCentsRef.current.length >= 4) {
        const values = recentCentsRef.current;
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const variance =
          values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
        const std = Math.sqrt(variance);
        liveStability = Math.max(0, Math.min(1, 1 - std / 40));
      }

      let accuracy = 0;
      let shouldAdvanceTime = true;
      let holdingForPitch = false;

      if (targetNote) {
        const noteId = targetNote.id;
        const noteEnd = targetNote.startMs + targetNote.durationMs;
        const scoringHz = getScoringHz(frame);

        if (
          wasVoiceActiveRef.current &&
          !isSungFrame(frame) &&
          isWithinNote(currentTime, targetNote) &&
          !scoredNotesRef.current.has(noteId)
        ) {
          timeMsRef.current = targetNote.startMs;
          setTimeMs(targetNote.startMs);
          noteActiveMsRef.current[noteId] = 0;
          holdingAtEndRef.current = null;
          recentCentsRef.current = [];
          currentTime = targetNote.startMs;
        }

        if (isSungFrame(frame)) {
          noteActiveMsRef.current[noteId] =
            (noteActiveMsRef.current[noteId] ?? 0) + TICK_MS;
        }

        const heldRatio = Math.min(
          1,
          (noteActiveMsRef.current[noteId] ?? 0) / targetNote.durationMs,
        );
        accuracy = getLiveAccuracyPercent(
          frameWithTime,
          targetNote,
          heldRatio,
          { comfortDb },
        );

        const pitchPercent =
          scoringHz !== null
            ? getPitchAccuracyPercent(getCentsError(scoringHz, targetNote.targetHz))
            : 0;

        if (currentTime >= noteEnd && !scoredNotesRef.current.has(noteId)) {
          if (pitchPercent < PAUSE_ACCURACY_THRESHOLD) {
            holdingAtEndRef.current = noteId;
            heldPastEndMsRef.current[noteId] =
              (heldPastEndMsRef.current[noteId] ?? 0) + TICK_MS;
            timeMsRef.current = noteEnd;
            setTimeMs(noteEnd);
            shouldAdvanceTime = false;
            holdingForPitch = true;
          } else if (isSungFrame(frame)) {
            scoredNotesRef.current.add(noteId);
            holdingAtEndRef.current = null;
            const performance = evaluateNote(framesRef.current, targetNote, {
              heldPastEndMs: heldPastEndMsRef.current[noteId] ?? 0,
              comfortDb,
            });
            performancesRef.current.push(performance);
            setLiveScore(
              Math.round(aggregateExerciseAccuracy(performancesRef.current)),
            );
          } else {
            holdingAtEndRef.current = noteId;
            heldPastEndMsRef.current[noteId] =
              (heldPastEndMsRef.current[noteId] ?? 0) + TICK_MS;
            timeMsRef.current = noteEnd;
            setTimeMs(noteEnd);
            shouldAdvanceTime = false;
            holdingForPitch = true;
          }
        } else if (holdingAtEndRef.current === noteId) {
          shouldAdvanceTime = false;
          holdingForPitch = true;
        }
      }

      const coaching = decideCoachingMessage({
        frame: enriched,
        note: targetNote,
        holdingForPitch,
        liveStability,
      });
      setCoachHint(getCoachingCopy(coaching));

      wasVoiceActiveRef.current = isSungFrame(frame);
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
              evaluateNote(framesRef.current, note, {
                heldPastEndMs: heldPastEndMsRef.current[note.id] ?? 0,
                comfortDb,
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
  }, [
    exerciseIndex,
    notes,
    exerciseDurationMs,
    onComplete,
    updateIndicatorVisuals,
    comfortDb,
  ]);

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
      hint={coachHint ?? `Ejercicio ${exerciseIndex} / 6`}
      score={sessionScore + liveScore}
      showPause
      onPausedChange={(isPaused) => {
        pausedRef.current = isPaused;
      }}
      onRestartSession={onRestartSession}
      onExitToLessonMenu={onExitToLessonMenu}
      onBack={onBack}
    >
      <View style={styles.laneWrapper}>
        <WarmupNoteStaircase
          notes={notes}
          vowelLabel={vowelLabel}
          mode="scrolling"
          activeNoteId={activeNoteId}
          activeNoteColor={activeNoteColor}
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
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.light,
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
