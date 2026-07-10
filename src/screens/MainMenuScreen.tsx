import { StyleSheet, Text, View } from 'react-native';
import { MainMenuGrid } from '../components/MainMenuGrid';
import { MainMenuDestination } from '../types/navigation';
import { palette } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type MainMenuScreenProps = {
  onNavigate: (destination: MainMenuDestination) => void;
};

export function MainMenuScreen({ onNavigate }: MainMenuScreenProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.heading}>SCREAM.io</Text>
      <Text style={styles.subheading}>¿Qué quieres hacer hoy?</Text>
      <MainMenuGrid onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.dark100,
    paddingTop: spacing.md,
  },
  heading: {
    fontFamily: fonts.title,
    fontSize: fontSizes.hero,
    color: palette.light,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: palette.light,
    opacity: 0.7,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
