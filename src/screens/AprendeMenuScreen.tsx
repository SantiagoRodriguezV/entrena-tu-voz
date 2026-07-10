import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SectionNivel, SECTION_NIVELES } from '../data/sectionNiveles';
import { SectionBackHeader } from '../components/SectionBackHeader';
import { palette, withOpacity } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

type AprendeMenuScreenProps = {
  onOpenNivel: (nivel: SectionNivel) => void;
  onNavigateHome: () => void;
};

function NivelCard({
  nivel,
  onPress,
}: {
  nivel: SectionNivel;
  onPress: () => void;
}) {
  const isAvailable = nivel.status === 'available';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isAvailable ? styles.cardAvailable : styles.cardLocked,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${nivel.title}, ${nivel.subtitle}`}
    >
      <Text style={styles.cardTitle}>{nivel.title}</Text>
      <Text style={styles.cardSubtitle}>{nivel.subtitle}</Text>
      {nivel.description ? (
        <Text style={styles.cardDescription}>{nivel.description}</Text>
      ) : null}
      {!isAvailable && <Text style={styles.comingSoon}>Próximamente</Text>}
    </Pressable>
  );
}

export function AprendeMenuScreen({ onOpenNivel, onNavigateHome }: AprendeMenuScreenProps) {
  return (
    <View style={styles.root}>
      <SectionBackHeader onBack={onNavigateHome} />
      <Text style={styles.heading}>Aprende</Text>
      <Text style={styles.subheading}>Elige un nivel para continuar</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTION_NIVELES.map((nivel) => (
          <NivelCard key={nivel.id} nivel={nivel} onPress={() => onOpenNivel(nivel)} />
        ))}
      </ScrollView>
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
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardAvailable: {
    backgroundColor: withOpacity(palette.turqShadeHeavy1, 0.85),
  },
  cardLocked: {
    backgroundColor: withOpacity(palette.dark70, 0.9),
    borderWidth: 1,
    borderColor: palette.dark60,
    opacity: 0.85,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTitle: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: palette.light,
    letterSpacing: 1,
    textAlign: 'left',
  },
  cardSubtitle: {
    fontFamily: fonts.title,
    fontSize: 12,
    color: palette.light,
    letterSpacing: 1.2,
    marginTop: 4,
    textAlign: 'left',
  },
  cardDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: palette.light,
    opacity: 0.8,
    marginTop: spacing.sm,
    textAlign: 'left',
    lineHeight: 20,
  },
  comingSoon: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: palette.grey2,
    marginTop: spacing.sm,
    textAlign: 'left',
  },
});
