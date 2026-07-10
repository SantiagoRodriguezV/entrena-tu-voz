import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type WelcomeStepProps = {
  onStart: () => void;
  onTitleLongPress: () => void;
};

export function WelcomeStep({ onStart, onTitleLongPress }: WelcomeStepProps) {
  return (
    <ScreenLayout>
      <View style={styles.hero}>
        <Pressable
          onLongPress={onTitleLongPress}
          delayLongPress={2000}
          accessibilityHint="Mantén presionado para abrir el modo investigador"
        >
          <Text style={styles.title} accessibilityRole="header">
            Entrena tu voz
          </Text>
        </Pressable>
        <Text style={styles.subtitle}>
          Aprende conceptos vocales mediante ejercicios guiados y feedback inmediato
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Comenzar" onPress={onStart} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.light,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
  },
});
