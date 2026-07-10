import { Image, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { PillActionButton } from '../components/PillActionButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

const warmupActiveImage = require('../../assets/images/warmup-active.png');

type WarmupCompletedScreenProps = {
  onContinue: () => void;
};

export function WarmupCompletedScreen({ onContinue }: WarmupCompletedScreenProps) {
  return (
    <ScreenLayout variant="dark" scrollable={false}>
      <View style={styles.content}>
        <Image source={warmupActiveImage} style={styles.icon} resizeMode="contain" />
        <Text style={styles.title}>¡Calentamiento completado!</Text>
        <Text style={styles.body}>
          Tu Token de Calentamiento está activo por hoy. Ya puedes comenzar tus lecciones.
        </Text>
      </View>
      <View style={styles.footer}>
        <PillActionButton variant="continue" onPress={onContinue} accessibilityLabel="Continuar" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  icon: {
    width: 96,
    height: 96,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.light,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
