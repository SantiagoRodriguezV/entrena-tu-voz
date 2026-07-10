import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { SectionBackHeader } from '../components/SectionBackHeader';
import { colors, palette } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type PlaceholderTabScreenProps = {
  title: string;
  onNavigateHome?: () => void;
};

export function PlaceholderTabScreen({ title, onNavigateHome }: PlaceholderTabScreenProps) {
  return (
    <View style={styles.root}>
      {onNavigateHome && <SectionBackHeader onBack={onNavigateHome} />}
      <ScreenLayout variant="dark">
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Próximamente</Text>
        </View>
      </ScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.dark100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.light,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },
});
