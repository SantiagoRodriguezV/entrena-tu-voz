import { ReactNode, RefObject, createContext, useContext, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MainTab } from '../types/exercise';
import { UserProgress } from '../audio/xpSystem';
import { BottomNavBar } from './BottomNavBar';
import { TopStatusBar } from './TopStatusBar';
import { palette } from '../theme/colors';

export type TopBarActions = {
  onOpenStreakPanel?: () => void;
  onOpenWarmupPanel?: () => void;
};

type HomeShellContextValue = {
  streakAnchorRef: RefObject<View | null>;
  warmupAnchorRef: RefObject<View | null>;
  topBarActionsRef: RefObject<TopBarActions>;
};

const HomeShellContext = createContext<HomeShellContextValue | null>(null);

export function useHomeShell() {
  const context = useContext(HomeShellContext);
  if (!context) {
    throw new Error('useHomeShell must be used within HomeShell');
  }
  return context;
}

type HomeShellProps = {
  children: ReactNode;
  showBottomNav: boolean;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  userProgress: UserProgress;
  streakActive: boolean;
  streakCount: number;
  warmupTokenActive: boolean;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onLongPress: () => void;
};

export function HomeShell({
  children,
  showBottomNav,
  activeTab,
  onTabChange,
  userProgress,
  streakActive,
  streakCount,
  warmupTokenActive,
  onOpenSettings,
  onOpenProfile,
  onLongPress,
}: HomeShellProps) {
  const streakAnchorRef = useRef<View>(null);
  const warmupAnchorRef = useRef<View>(null);
  const topBarActionsRef = useRef<TopBarActions>({});

  const handleOpenStreak = () => {
    topBarActionsRef.current.onOpenStreakPanel?.();
  };

  const handleOpenWarmup = () => {
    topBarActionsRef.current.onOpenWarmupPanel?.();
  };

  return (
    <HomeShellContext.Provider
      value={{ streakAnchorRef, warmupAnchorRef, topBarActionsRef }}
    >
      <View style={styles.root}>
        <TopStatusBar
          userProgress={userProgress}
          streakActive={streakActive}
          streakCount={streakCount}
          warmupTokenActive={warmupTokenActive}
          streakAnchorRef={streakAnchorRef}
          warmupAnchorRef={warmupAnchorRef}
          onOpenStreakPanel={handleOpenStreak}
          onOpenWarmupPanel={handleOpenWarmup}
          onOpenSettings={onOpenSettings}
          onOpenProfile={onOpenProfile}
          onLongPress={onLongPress}
        />
        <View style={styles.content}>{children}</View>
        {showBottomNav && (
          <BottomNavBar activeTab={activeTab} onTabChange={onTabChange} />
        )}
      </View>
    </HomeShellContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.dark100,
  },
  content: {
    flex: 1,
  },
});
