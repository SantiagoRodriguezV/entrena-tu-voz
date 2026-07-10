import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BackConfirmPanel } from '../components/BackConfirmPanel';
import { IntroScreenLayout } from '../components/IntroScreenLayout';
import { PillActionButton } from '../components/PillActionButton';
import { LESSON_EXERCISE_COUNT } from '../data/lessonExercises';
import { colors, palette } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type LessonIntroScreenProps = {
  title: string;
  onContinue: () => void;
  onBack: () => void;
};

export function LessonIntroScreen({ title, onContinue, onBack }: LessonIntroScreenProps) {
  const [backConfirmVisible, setBackConfirmVisible] = useState(false);

  return (
    <IntroScreenLayout
      title={<Text style={styles.title}>{title}</Text>}
      footer={
        <>
          <PillActionButton
            variant="continue"
            onPress={onContinue}
            accessibilityLabel="Comenzar lección"
          />
          <View style={styles.backWrap}>
            <Text style={styles.backLink} onPress={() => setBackConfirmVisible(true)}>
              Volver al mapa
            </Text>
          </View>
          <BackConfirmPanel
            visible={backConfirmVisible}
            onDismiss={() => setBackConfirmVisible(false)}
            onConfirm={onBack}
          />
        </>
      }
    >
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
    </IntroScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: colors.secondary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.light,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  warningCard: {
    backgroundColor: palette.dark80,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.light,
    lineHeight: 22,
    textAlign: 'center',
  },
  backWrap: {
    alignItems: 'center',
  },
  backLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
