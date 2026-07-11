import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackConfirmPanel } from '../BackConfirmPanel';
import { colors, palette } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { fonts, fontSizes } from '../../theme/typography';
import ConfiguracionIcon from '../../../assets/icons/configuracion.svg';
import { ExerciseSettingsPanel } from './ExerciseSettingsPanel';

type ExercisePauseOverlayProps = {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExitToLessonMenu: () => void;
};

export function ExercisePauseOverlay({
  visible,
  onResume,
  onRestart,
  onExitToLessonMenu,
}: ExercisePauseOverlayProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    if (!visible) {
      setShowExitConfirm(false);
      setShowSettings(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.dim} />
        <View style={styles.content}>
          {showSettings ? (
            <ExerciseSettingsPanel
              volume={volume}
              onVolumeChange={setVolume}
              onClose={() => setShowSettings(false)}
            />
          ) : (
            <View style={styles.menu}>
              <Text style={styles.title}>Pausa</Text>

              <Pressable
                onPress={onRestart}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Volver a comenzar"
              >
                <Text style={styles.actionText}>Volver a comenzar</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowExitConfirm(true)}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Volver al Mapa de Aprendizaje"
              >
                <Text style={styles.actionText}>Volver al Mapa de Aprendizaje</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowSettings(true)}
                style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Ajustes"
              >
                <ConfiguracionIcon width={40} height={40} />
              </Pressable>

              <Pressable
                onPress={onResume}
                style={({ pressed }) => [styles.resumeLink, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Continuar"
              >
                <Text style={styles.resumeText}>Continuar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <BackConfirmPanel
        visible={showExitConfirm}
        onDismiss={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false);
          onExitToLessonMenu();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  content: {
    zIndex: 1,
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  menu: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.xxl,
    color: colors.light,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: palette.turqShadeMain,
    alignItems: 'center',
  },
  actionText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.light,
    textAlign: 'center',
  },
  settingsBtn: {
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  resumeLink: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  resumeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
