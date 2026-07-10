import { ReactNode, RefObject, useCallback, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, PANEL_ANCHOR_GAP, spacing } from '../theme/spacing';
import { fonts, fontSizes } from '../theme/typography';

export type AnchorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type AnchoredInfoPanelProps = {
  visible: boolean;
  title: string;
  anchorRef: RefObject<View | null>;
  scrollY?: number;
  onDismiss: () => void;
  children: ReactNode;
  panelWidth?: number;
  safeTop?: number;
  safeBottom?: number;
};

export function AnchoredInfoPanel({
  visible,
  title,
  anchorRef,
  scrollY = 0,
  onDismiss,
  children,
  panelWidth = 280,
  safeTop = 80,
  safeBottom = 120,
}: AnchoredInfoPanelProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
  const [panelHeight, setPanelHeight] = useState(200);

  const measureAnchor = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(measureAnchor, 0);
    return () => clearTimeout(timer);
  }, [visible, measureAnchor, scrollY]);

  if (!visible || !anchorRect) return null;

  let top = anchorRect.y + anchorRect.height + PANEL_ANCHOR_GAP;
  const maxTop = windowHeight - safeBottom - panelHeight;
  top = Math.max(safeTop, Math.min(top, maxTop));

  let left = anchorRect.x + anchorRect.width / 2 - panelWidth / 2;
  left = Math.max(spacing.md, Math.min(left, windowWidth - panelWidth - spacing.md));

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          onLayout={(e: LayoutChangeEvent) => {
            setPanelHeight(e.nativeEvent.layout.height);
          }}
          style={[styles.panel, { top, left, width: panelWidth }]}
        >
          <Text style={styles.title}>{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: '#0D6E74',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: fontSizes.lg,
    color: colors.light,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
});
