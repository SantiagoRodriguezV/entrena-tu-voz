import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ExerciseBackHeader } from '../components/ExerciseBackHeader';
import { PillActionButton } from '../components/PillActionButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type RotateDeviceScreenProps = {
  onContinue: () => void;
  onBack: () => void;
};

const rotateImage = require('../../assets/images/rota-tu-celular.png');
function isLandscapeOrientation(
  orientation: ScreenOrientation.Orientation,
): boolean {
  return (
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
  );
}

export function RotateDeviceScreen({ onContinue, onBack }: RotateDeviceScreenProps) {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});

    const checkOrientation = async () => {
      const orientation = await ScreenOrientation.getOrientationAsync();
      setIsLandscape(isLandscapeOrientation(orientation));
    };
    checkOrientation();

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setIsLandscape(isLandscapeOrientation(event.orientationInfo.orientation));
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isLandscape) {
      const timer = setTimeout(onContinue, 400);
      return () => clearTimeout(timer);
    }
  }, [isLandscape, onContinue]);

  return (
    <ScreenLayout variant="dark">
      <View style={styles.backRow}>
        <ExerciseBackHeader onConfirmBack={onBack} />
      </View>
      <View style={styles.center}>
        <Image source={rotateImage} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>Rota tu celular hacia la izquierda</Text>
        <Text style={styles.subtitle}>
          Los ejercicios vocales se realizan en horizontal para ver mejor las notas.
        </Text>
        {(Platform.OS === 'web' || isLandscape) && (
          <View style={styles.buttonWrap}>
            <PillActionButton
              variant="continue"
              onPress={onContinue}
              accessibilityLabel="Continuar"
            />
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  backRow: {
    paddingTop: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  image: {
    width: 220,
    height: 160,
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xl,
    color: colors.light,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 320,
  },
});
