import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ScreenLayoutProps = {
  children: ReactNode;
  scrollable?: boolean;
  variant?: 'dark' | 'light';
  style?: ViewStyle;
};

export function ScreenLayout({
  children,
  scrollable = true,
  variant = 'dark',
  style,
}: ScreenLayoutProps) {
  const bgColor = variant === 'dark' ? colors.background : colors.backgroundLight;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
});
