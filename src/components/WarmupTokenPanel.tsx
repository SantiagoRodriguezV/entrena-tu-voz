import { RefObject } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AnchoredInfoPanel } from './AnchoredInfoPanel';
import { PillActionButton } from './PillActionButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

const warmupActiveImage = require('../../assets/images/warmup-active.png');
const warmupInactiveImage = require('../../assets/images/warmup-inactive.png');

type WarmupTokenPanelProps = {
  visible: boolean;
  anchorRef: RefObject<View | null>;
  isTokenActive: boolean;
  onDismiss: () => void;
  onStartWarmup: () => void;
};

export function WarmupTokenPanel({
  visible,
  anchorRef,
  isTokenActive,
  onDismiss,
  onStartWarmup,
}: WarmupTokenPanelProps) {
  return (
    <AnchoredInfoPanel
      visible={visible}
      title="Token de calentamiento"
      anchorRef={anchorRef}
      onDismiss={onDismiss}
      panelWidth={300}
    >
      <View style={styles.iconWrap}>
        <Image
          source={isTokenActive ? warmupActiveImage : warmupInactiveImage}
          style={styles.tokenIcon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.message}>
        {isTokenActive
          ? 'Ya completaste tu calentamiento hoy. ¡Buen trabajo!'
          : 'Aún no has hecho el calentamiento hoy. Hazlo antes de comenzar una lección.'}
      </Text>
      {!isTokenActive && (
        <View style={styles.buttonWrap}>
          <PillActionButton
            variant="continue"
            onPress={() => {
              onDismiss();
              onStartWarmup();
            }}
            accessibilityLabel="Hacer calentamiento"
          />
        </View>
      )}
    </AnchoredInfoPanel>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tokenIcon: {
    width: 72,
    height: 72,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  buttonWrap: {
    marginTop: spacing.sm,
  },
});
