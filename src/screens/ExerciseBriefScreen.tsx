import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { exerciseNotes } from '../data/exerciseNotes';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type ExerciseBriefScreenProps = {
  onStartExercise: () => void;
  onBack: () => void;
};

const BRIEF_NOTES = exerciseNotes.slice(0, 3);

const POINTS = [
  'Altura: intenta mantenerte dentro de la nota.',
  'Volumen: busca un rango moderado.',
  'Duración: sostén la voz durante el largo de cada nota.',
];

export function ExerciseBriefScreen({ onStartExercise, onBack }: ExerciseBriefScreenProps) {
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    indicatorX.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorX.value * 72}%`,
  }));

  return (
    <ScreenLayout variant="dark">
      <Text style={styles.title}>Cómo funciona</Text>
      <Text style={styles.subtitle}>
        La lección tiene 6 ejercicios. Canta cada nota mientras el indicador pasa por ella.
      </Text>

      <View style={styles.lanePreview}>
        <View style={styles.notesRow}>
          {BRIEF_NOTES.map((note) => (
            <View key={note.id} style={styles.noteBlock}>
              <Text style={styles.noteLabel}>{note.label}</Text>
            </View>
          ))}
        </View>
        <Animated.View style={[styles.voiceDot, indicatorStyle]} />
      </View>

      <View style={styles.pointsList}>
        {POINTS.map((point, index) => (
          <View key={point} style={styles.pointRow}>
            <View style={styles.bullet}>
              <Text style={styles.bulletText}>{index + 1}</Text>
            </View>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Ir al ejercicio" onPress={onStartExercise} />
        <View style={styles.spacer} />
        <PrimaryButton label="Volver" onPress={onBack} variant="outline" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.light,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  lanePreview: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    justifyContent: 'center',
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  noteBlock: {
    flex: 1,
    height: 48,
    backgroundColor: colors.secondary + '33',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.secondary,
  },
  voiceDot: {
    position: 'absolute',
    bottom: spacing.lg,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pointsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
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
    color: '#FFF',
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: fontSizes.sm,
  },
  pointText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing.md,
  },
  spacer: {
    height: spacing.sm,
  },
});
