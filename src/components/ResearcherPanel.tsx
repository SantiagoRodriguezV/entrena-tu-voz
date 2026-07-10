import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  DEMO_SCENARIOS,
  getScenarioLabel,
  setDemoScenario,
} from '../audio/DemoVocalEngine';
import { DemoScenario } from '../types/exercise';
import { colors } from '../theme/colors';
import { borderRadius, minTouchSize, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';
import { PrimaryButton } from './PrimaryButton';

type ResearcherPanelProps = {
  visible: boolean;
  selectedScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  onClose: () => void;
};

export function ResearcherPanel({
  visible,
  selectedScenario,
  onSelectScenario,
  onClose,
}: ResearcherPanelProps) {
  const handleSelect = (scenario: DemoScenario) => {
    setDemoScenario(scenario);
    onSelectScenario(scenario);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.badge}>Herramienta de prototipado</Text>
            <Text style={styles.title}>Modo investigador</Text>
            <Text style={styles.description}>
              Selecciona un escenario para controlar el motor vocal simulado durante
              el ejercicio. Mantén presionada la barra superior para abrir este panel.
            </Text>

            {DEMO_SCENARIOS.map((scenario) => {
              const isSelected = scenario === selectedScenario;
              return (
                <Pressable
                  key={scenario}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(scenario)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.optionLabel}>{getScenarioLabel(scenario)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <PrimaryButton label="Cerrar panel" onPress={onClose} variant="outline" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
    gap: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning + '33',
    color: colors.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  title: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.title,
    color: colors.light,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    minHeight: minTouchSize,
  },
  optionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary + '12',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.secondary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
  },
  optionLabel: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.light,
  },
});
