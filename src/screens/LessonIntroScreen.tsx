import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { LESSON_EXERCISE_COUNT } from '../data/lessonExercises';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type LessonIntroScreenProps = {
  title: string;
  onContinue: () => void;
  onBack: () => void;
};

export function LessonIntroScreen({ title, onContinue, onBack }: LessonIntroScreenProps) {
  return (
    <ScreenLayout variant="dark">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>
        Esta lección incluye {LESSON_EXERCISE_COUNT} ejercicios vocales. La app
        observará en tiempo real tu altura, volumen y duración para darte feedback.
      </Text>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          Usa una intensidad cómoda. Detente si aparece dolor, irritación o
          molestia.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Comenzar" onPress={onContinue} />
        <View style={styles.spacer} />
        <PrimaryButton label="Volver al mapa" onPress={onBack} variant="outline" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  warningCard: {
    backgroundColor: colors.warning + '33',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: spacing.xl,
  },
  warningText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing.lg,
  },
  spacer: {
    height: spacing.sm,
  },
});
