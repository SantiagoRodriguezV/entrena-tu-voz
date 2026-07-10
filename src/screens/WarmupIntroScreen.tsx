import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BackConfirmPanel } from '../components/BackConfirmPanel';
import { IntroScreenLayout } from '../components/IntroScreenLayout';
import { PillActionButton } from '../components/PillActionButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type WarmupIntroScreenProps = {
  onContinue: () => void;
  onBack: () => void;
};

export function WarmupIntroScreen({ onContinue, onBack }: WarmupIntroScreenProps) {
  const [backConfirmVisible, setBackConfirmVisible] = useState(false);

  return (
    <IntroScreenLayout
      title={<Text style={styles.title}>Calentamiento</Text>}
      footer={
        <>
          <PillActionButton
            variant="continue"
            onPress={onContinue}
            accessibilityLabel="Comenzar calentamiento"
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
        Antes de entrenar, realiza tu calentamiento vocal diario. Al completarlo,
        activarás tu Token de Calentamiento por el resto del día.
      </Text>
      <Text style={styles.hint}>
        Este proceso es obligatorio una vez al día antes de comenzar cualquier lección.
      </Text>
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
    marginBottom: spacing.md,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
