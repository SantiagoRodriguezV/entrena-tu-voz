import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';

type LearningPathStepProps = {
  onSelectLesson: () => void;
  onBack: () => void;
};

export function LearningPathStep({ onSelectLesson, onBack }: LearningPathStepProps) {
  return (
    <ScreenLayout>
      <Text style={styles.heading}>Tu ruta de aprendizaje</Text>
      <Text style={styles.subheading}>
        Avanza por cada etapa: descubre, explora y practica
      </Text>

      <View style={styles.path}>
        <PathNode label="Descubre" status="locked" />
        <View style={styles.connector} />
        <PathNode label="Explora" status="locked" />
        <View style={styles.connector} />
        <Pressable
          style={styles.lessonNode}
          onPress={onSelectLesson}
          accessibilityRole="button"
          accessibilityLabel="Cambio de registro, disponible"
        >
          <View style={styles.lessonBadge}>
            <Text style={styles.lessonBadgeText}>Practica</Text>
          </View>
          <Text style={styles.lessonTitle}>Cambio de registro</Text>
          <Text style={styles.lessonHint}>Toca para comenzar la lección</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Volver" onPress={onBack} variant="outline" />
      </View>
    </ScreenLayout>
  );
}

function PathNode({
  label,
  status,
}: {
  label: string;
  status: 'locked' | 'active';
}) {
  const isLocked = status === 'locked';
  return (
    <View style={styles.nodeRow}>
      <View style={[styles.nodeCircle, isLocked && styles.nodeLocked]}>
        <Text style={styles.nodeCircleText}>{isLocked ? '·' : '✓'}</Text>
      </View>
      <View>
        <Text style={[styles.nodeLabel, isLocked && styles.nodeLabelLocked]}>
          {label}
        </Text>
        {isLocked && <Text style={styles.lockedHint}>Próximamente</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light,
    marginBottom: spacing.sm,
  },
  subheading: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  path: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  nodeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.nodeActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLocked: {
    backgroundColor: colors.nodeLocked,
  },
  nodeCircleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nodeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light,
  },
  nodeLabelLocked: {
    color: colors.textMuted,
  },
  lockedHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  connector: {
    width: 3,
    height: 32,
    backgroundColor: colors.border,
    marginLeft: 20,
    alignSelf: 'flex-start',
  },
  lessonNode: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
    marginTop: spacing.md,
  },
  lessonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  lessonBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light,
    marginBottom: spacing.xs,
  },
  lessonHint: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
