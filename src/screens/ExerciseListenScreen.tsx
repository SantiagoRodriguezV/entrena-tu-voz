import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { playNoteSequence, stopNotePlayback } from '../audio/notePlayer';
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
  onStartExercise: () => void;
};

type Phase = 'intro' | 'playing' | 'readyToSing';

export function ExerciseListenScreen({
  lessonTitle,
  vowelLabel,
  notes,
  vocalFrame,
  micReady,
  onStartExercise,
}: ExerciseListenScreenProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [illuminatedNoteId, setIlluminatedNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackIdRef = useRef(0);
  const hasStartedRef = useRef(false);
  const messageOpacity = useSharedValue(0);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const playSequence = useCallback(async () => {
    const playbackId = ++playbackIdRef.current;
    stopNotePlayback();
    setIsPlaying(true);
    setIlluminatedNoteId(null);

    await playNoteSequence(notes, {
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

    if (playbackId !== playbackIdRef.current) return;
    setIsPlaying(false);
    setPhase('readyToSing');
  }, [notes]);

  const handleRepeat = useCallback(() => {
    playbackIdRef.current += 1;
    stopNotePlayback();
    setPhase('playing');
    void playSequence();
  }, [playSequence]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    messageOpacity.value = withSequence(
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 1400 }),
      withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) }),
    );

    const timer = setTimeout(() => {
      setPhase('playing');
      void playSequence();
    }, 2600);

    return () => {
      clearTimeout(timer);
      playbackIdRef.current += 1;
      stopNotePlayback();
    };
  }, [messageOpacity, playSequence]);

  useEffect(() => {
    if (phase !== 'readyToSing') return;
    if (!micReady) return;
    if (vocalFrame?.isVoiceActive) {
      onStartExercise();
    }
  }, [phase, micReady, vocalFrame?.isVoiceActive, onStartExercise]);

  const hint =
    phase === 'intro'
      ? undefined
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
      footer={
        <View style={styles.footer}>
          {phase === 'intro' ? (
            <Animated.Text style={[styles.introMessage, messageStyle]}>
              Escucha primero como suena y luego repite
            </Animated.Text>
          ) : null}
          {(phase === 'playing' || phase === 'readyToSing') && (
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
  introMessage: {
    fontFamily: 'AtkinsonHyperlegible-Regular',
    fontSize: 16,
    color: '#22BAA6',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  repeatWrap: {
    width: 200,
  },
});
