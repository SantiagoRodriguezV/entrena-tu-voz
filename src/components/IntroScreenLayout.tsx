import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from './ScreenLayout';
import { scaleH } from '../theme/responsive';
import { spacing } from '../theme/spacing';
import { useResponsive } from '../theme/responsive';

const INTRO_TITLE_Y = 218;

type IntroScreenLayoutProps = {
  title: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  contentStyle?: ViewStyle;
};

export function IntroScreenLayout({
  title,
  children,
  footer,
  contentStyle,
}: IntroScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { height } = useResponsive();
  const titleTop = Math.max(
    spacing.lg,
    scaleH(INTRO_TITLE_Y, height) - insets.top,
  );

  return (
    <ScreenLayout variant="dark" scrollable={false} style={styles.screen}>
      <View style={[styles.titleWrap, { paddingTop: titleTop }]}>{title}</View>
      <View style={[styles.content, contentStyle]}>{children}</View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        {footer}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    paddingBottom: 0,
  },
  titleWrap: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
