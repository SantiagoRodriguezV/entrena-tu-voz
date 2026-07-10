import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { BackConfirmPanel } from './BackConfirmPanel';
import { palette } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { useResponsive } from '../theme/responsive';

type ExerciseBackHeaderProps = {
  onConfirmBack: () => void;
  accessibilityLabel?: string;
};

export function ExerciseBackHeader({
  onConfirmBack,
  accessibilityLabel = 'Volver al mapa de lecciones',
}: ExerciseBackHeaderProps) {
  const { moderateScale } = useResponsive();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const buttonSize = moderateScale(40);

  return (
    <>
      <Pressable
        onPress={() => setConfirmVisible(true)}
        style={({ pressed }) => [
          styles.backButton,
          { width: buttonSize, height: buttonSize },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={[styles.backChevron, { fontSize: moderateScale(fontSizes.xxl) }]}>
          {'<'}
        </Text>
      </Pressable>

      <BackConfirmPanel
        visible={confirmVisible}
        onDismiss={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          onConfirmBack();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontFamily: fonts.title,
    color: palette.light,
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.85,
  },
});
