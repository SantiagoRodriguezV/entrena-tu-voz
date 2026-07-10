import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type SectionBackHeaderProps = {
  onBack: () => void;
};

export function SectionBackHeader({ onBack }: SectionBackHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.backButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Volver al menú principal"
      >
        <Text style={styles.backChevron}>{'<'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: palette.light,
    lineHeight: 28,
  },
});
