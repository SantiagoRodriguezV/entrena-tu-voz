import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { spacing } from '../theme/spacing';

type ExerciseReadyScreenProps = {
  onContinue: () => void;
};

const READY_MS = 5000;

/** Brief instruction before the first exercise of a session. */
export function ExerciseReadyScreen({ onContinue }: ExerciseReadyScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onContinue, READY_MS);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <ScreenLayout variant="dark">
      <View style={styles.center}>
        <Text style={styles.message}>Escucha el ejercicio y luego repite</Text>
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
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xl,
    color: colors.light,
    textAlign: 'center',
    lineHeight: 32,
  },
});
