import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { playNoteSequence, stopNotePlayback } from '../audio/notePlayer';
import {
  startRealVocalEngine,
  stopRealVocalEngine,
} from '../audio/RealVocalEngine';
import { createSungVoiceGate } from '../audio/evaluation/sungVoiceGate';
import { PillActionButton } from '../components/PillActionButton';
import { WarmupExerciseShell } from '../components/warmup/WarmupExerciseShell';
import { WarmupNoteStaircase } from '../components/warmup/WarmupNoteStaircase';
import { ExerciseNote, VocalFrame } from '../types/exercise';

type ExerciseListenScreenProps = {
  exerciseIndex: number;
  lessonTitle: string;
  vowelLabel: string;
  notes: ExerciseNote[];
  vocalFrame: VocalFrame | null;
  micReady: boolean;
  sessionScore?: number;
  onStartExercise: () => void;
  onBack: () => void;
  onRestartSession: () => void;
  onExitToLessonMenu: () => void;
};

type Phase = 'waiting' | 'playing' | 'readyToSing';

const POLL_MS = 50;
const PRE_PLAY_DELAY_MS = 2000;
/** Slightly shorter hold so start is responsive after demo playback. */
const START_VOICE_HOLD_MS = 300;

export function ExerciseListenScreen({
  lessonTitle,
  vowelLabel,
  notes,
  vocalFrame,
  micReady,
  sessionScore = 0,
  onStartExercise,
  onBack,
  onRestartSession,
  onExitToLessonMenu,
}: ExerciseListenScreenProps) {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [illuminatedNoteId, setIlluminatedNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const playbackIdRef = useRef(0);
  const startedExerciseRef = useRef(false);
  const voiceGateRef = useRef(createSungVoiceGate(START_VOICE_HOLD_MS));
  const vocalFrameRef = useRef(vocalFrame);
  const pausedRef = useRef(false);
  const onStartExerciseRef = useRef(onStartExercise);
  const notesRef = useRef(notes);

  useEffect(() => {
    vocalFrameRef.current = vocalFrame;
  }, [vocalFrame]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onStartExerciseRef.current = onStartExercise;
  }, [onStartExercise]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const playSequence = useCallback(async () => {
    const playbackId = ++playbackIdRef.current;
    stopNotePlayback();
    setIsPlaying(true);
    setIlluminatedNoteId(null);
    voiceGateRef.current.reset();
    startedExerciseRef.current = false;

    // Release the mic so demo tones can play on the speaker.
    await stopRealVocalEngine();

    try {
      await playNoteSequence(notesRef.current, {
        gapMs: 0,
        onNoteStart: (note) => {
          if (playbackId !== playbackIdRef.current) return;
          setIlluminatedNoteId(note.id);
        },
        onNoteEnd: () => {
          if (playbackId !== playbackIdRef.current) return;
          setIlluminatedNoteId(null);
        },
      });
    } finally {
      if (playbackId === playbackIdRef.current) {
        await startRealVocalEngine();
      }
    }

    if (playbackId !== playbackIdRef.current) return;
    setIsPlaying(false);
    voiceGateRef.current.reset();
    setPhase('readyToSing');
  }, []);

  const handleRepeat = useCallback(() => {
    if (pausedRef.current) return;
    playbackIdRef.current += 1;
    stopNotePlayback();
    voiceGateRef.current.reset();
    startedExerciseRef.current = false;
    setPhase('playing');
    void playSequence();
  }, [playSequence]);

  // Auto-start once on mount — do not re-bind to notes/playSequence identity
  // (parent re-renders every mic frame and would abort playback forever).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pausedRef.current) return;
      setPhase('playing');
      void playSequence();
    }, PRE_PLAY_DELAY_MS);

    return () => {
      clearTimeout(timer);
      playbackIdRef.current += 1;
      stopNotePlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  useEffect(() => {
    if (phase !== 'readyToSing') return;
    if (!micReady) return;

    voiceGateRef.current.reset();
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      if (startedExerciseRef.current) return;
      if (voiceGateRef.current.update(vocalFrameRef.current, POLL_MS)) {
        startedExerciseRef.current = true;
        onStartExerciseRef.current();
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [phase, micReady]);

  const handlePausedChange = useCallback((isPaused: boolean) => {
    setPaused(isPaused);
    if (isPaused) {
      playbackIdRef.current += 1;
      stopNotePlayback();
      setIsPlaying(false);
      setIlluminatedNoteId(null);
    }
  }, []);

  const hint =
    phase === 'waiting'
      ? 'Prepárate…'
      : phase === 'playing'
        ? 'Escuchando las notas…'
        : micReady
          ? 'Canta cuando estés listo'
          : 'Preparando micrófono…';

  return (
    <WarmupExerciseShell
      lessonTitle={lessonTitle}
      vowelLabel={vowelLabel}
      hint={hint}
      score={sessionScore}
      showPause
      onPausedChange={handlePausedChange}
      onRestartSession={onRestartSession}
      onExitToLessonMenu={onExitToLessonMenu}
      onBack={onBack}
      footer={
        <View style={styles.footer}>
          {(phase === 'playing' || phase === 'readyToSing') && !paused && (
            <View style={styles.repeatWrap}>
              <PillActionButton
                variant="repeat"
                onPress={handleRepeat}
                disabled={isPlaying}
                accessibilityLabel="Repetir escucha"
              />
            </View>
          )}
        </View>
      }
    >
      <WarmupNoteStaircase
        notes={notes}
        vowelLabel={vowelLabel}
        mode="static"
        illuminatedNoteId={illuminatedNoteId}
      />
    </WarmupExerciseShell>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  repeatWrap: {
    width: '70%',
    maxWidth: 280,
  },
});
