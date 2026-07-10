import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { setDemoScenario } from './src/audio/DemoVocalEngine';
import { countNotesAboveAccuracy } from './src/audio/accuracyUtils';
import {
  calculateExerciseXp,
  getInitialUserProgress,
  addXp,
  UserProgress,
} from './src/audio/xpSystem';
import { useVocalRecorder } from './src/audio/useVocalRecorder';
import { HomeShell } from './src/components/HomeShell';
import { ResearcherPanel } from './src/components/ResearcherPanel';
import { ScreenLevelMapSlideTransition } from './src/components/ScreenLevelMapSlideTransition';
import type { NavDirection } from './src/components/ScreenLevelMapSlideTransition';
import { SettingsModal } from './src/components/SettingsModal';
import { ExerciseListenScreen } from './src/screens/ExerciseListenScreen';
import { ExerciseMiniResultScreen } from './src/screens/ExerciseMiniResultScreen';
import { NivelVisualizationScreen } from './src/screens/NivelVisualizationScreen';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { AprendeMenuScreen } from './src/screens/AprendeMenuScreen';
import { LessonCompletedScreen } from './src/screens/LessonCompletedScreen';
import { LessonIntroScreen } from './src/screens/LessonIntroScreen';
import { PlaceholderTabScreen } from './src/screens/PlaceholderTabScreen';
import { RotateDeviceScreen } from './src/screens/RotateDeviceScreen';
import { VocalExerciseScreen } from './src/screens/VocalExerciseScreen';
import { WarmupCompletedScreen } from './src/screens/WarmupCompletedScreen';
import { WarmupIntroScreen } from './src/screens/WarmupIntroScreen';
import { getLessonExercise, LESSON_EXERCISE_COUNT } from './src/data/lessonExercises';
import {
  getWarmupExercise,
  WARMUP_EXERCISE_COUNT,
} from './src/data/warmupExercises';
import { useDailyActivity } from './src/hooks/useDailyActivity';
import { useExerciseOrientation } from './src/hooks/useExerciseOrientation';
import { useLevelProgress } from './src/hooks/useLevelProgress';
import {
  AppScreen,
  DemoScenario,
  ExerciseSessionResult,
  Level,
  MainTab,
  SessionMode,
} from './src/types/exercise';
import { colors } from './src/theme/colors';
import {
  AprendeRoute,
  HomeRoute,
  MainMenuDestination,
} from './src/types/navigation';

const TAB_TITLES: Record<Exclude<HomeRoute, 'mainMenu' | 'dailySession' | 'aprende'>, string> = {
  entrena: 'Entrena',
  desafios: 'Desafíos',
  perfil: 'Perfil',
};

const TAB_TO_HOME_ROUTE: Record<MainTab, HomeRoute> = {
  menu: 'mainMenu',
  aprende: 'aprende',
  entrena: 'entrena',
  desafios: 'desafios',
};

const SLIDE_SESSION_SCREENS = new Set<AppScreen>([
  'warmupIntro',
  'lessonIntro',
  'rotateDevice',
  'exerciseListen',
  'vocalExercise',
  'exerciseMiniResult',
  'warmupCompleted',
  'lessonCompleted',
]);

function getExerciseCount(mode: SessionMode): number {
  return mode === 'warmup' ? WARMUP_EXERCISE_COUNT : LESSON_EXERCISE_COUNT;
}

function getExerciseForMode(mode: SessionMode, index: number) {
  return mode === 'warmup' ? getWarmupExercise(index) : getLessonExercise(index);
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [homeRoute, setHomeRoute] = useState<HomeRoute>('mainMenu');
  const [activeTab, setActiveTab] = useState<MainTab>('menu');
  const [aprendeRoute, setAprendeRoute] = useState<AprendeRoute>('nivelPicker');
  const [activeSectionNivelId, setActiveSectionNivelId] = useState('nivel-1');
  const [sessionMode, setSessionMode] = useState<SessionMode>('lesson');
  const [activeLessonLevel, setActiveLessonLevel] = useState<Level | null>(null);
  const [pendingLessonLevel, setPendingLessonLevel] = useState<Level | null>(null);
  const [researchScenario, setResearchScenario] = useState<DemoScenario>('good');
  const [researcherPanelVisible, setResearcherPanelVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [navDirection, setNavDirection] = useState<NavDirection>('forward');
  const [sessionExiting, setSessionExiting] = useState(false);
  const pendingExitActionRef = useRef<(() => void) | null>(null);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<ExerciseSessionResult[]>([]);
  const [lastMiniResult, setLastMiniResult] = useState<ExerciseSessionResult | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(getInitialUserProgress());
  const [progressBeforeLesson, setProgressBeforeLesson] = useState<UserProgress>(
    getInitialUserProgress(),
  );

  const {
    levels,
    recentlyUnlockedId,
    completeLevel,
    clearUnlockAnimation,
  } = useLevelProgress();

  const {
    state: dailyState,
    isStreakActive,
    isWarmupTokenActive,
    completeWarmup,
    recordVocalExercise,
  } = useDailyActivity();

  const vocalRecorder = useVocalRecorder();

  useExerciseOrientation(currentScreen);

  const [fontsLoaded] = useFonts({
    'Bungee-Regular': require('./assets/fonts/Bungee-Regular.ttf'),
    'AtkinsonHyperlegible-Regular': require('./assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
        () => {},
      );
    }
  }, []);

  useEffect(() => {
    setDemoScenario(researchScenario);
  }, [researchScenario]);

  const [micReady, setMicReady] = useState(false);

  useEffect(() => {
    if (currentScreen === 'exerciseListen' || currentScreen === 'vocalExercise') {
      vocalRecorder.start().then((ok) => setMicReady(ok));
    } else {
      setMicReady(false);
      vocalRecorder.stop();
    }
    return () => {
      vocalRecorder.stop();
      setMicReady(false);
    };
  }, [currentScreen, vocalRecorder.start, vocalRecorder.stop]);

  const resetSession = useCallback(() => {
    setCurrentExerciseIndex(0);
    setSessionResults([]);
    setLastMiniResult(null);
  }, []);

  const resetLessonSession = useCallback(() => {
    resetSession();
    setProgressBeforeLesson(userProgress);
  }, [resetSession, userProgress]);

  const goToScreen = useCallback((screen: AppScreen) => {
    setNavDirection('forward');
    setSessionExiting(false);
    setCurrentScreen(screen);
  }, []);

  const handleExitExerciseFlow = useCallback(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
        () => {},
      );
    }

    const wasLesson = sessionMode === 'lesson';
    const hadPendingLesson = pendingLessonLevel !== null;
    const fromMainMenu = homeRoute === 'mainMenu' || homeRoute === 'dailySession';

    resetSession();
    setActiveLessonLevel(null);
    setPendingLessonLevel(null);
    setSessionMode('lesson');
    setNavDirection('back');
    setCurrentScreen('home');

    if (wasLesson || hadPendingLesson) {
      setHomeRoute('aprende');
      setAprendeRoute('nivelVisualization');
      setActiveTab('aprende');
    } else if (fromMainMenu) {
      setHomeRoute('mainMenu');
      setAprendeRoute('nivelPicker');
      setActiveTab('menu');
    } else {
      setHomeRoute('aprende');
      setAprendeRoute('nivelVisualization');
      setActiveTab('aprende');
    }
  }, [homeRoute, pendingLessonLevel, resetSession, sessionMode]);

  const requestSessionExit = useCallback((exitAction: () => void) => {
    setNavDirection('back');
    pendingExitActionRef.current = exitAction;
    setSessionExiting(true);
  }, []);

  const handleExitAnimationComplete = useCallback(() => {
    const action = pendingExitActionRef.current;
    pendingExitActionRef.current = null;
    setSessionExiting(false);
    action?.();
  }, []);

  const handleGoHome = useCallback(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
        () => {},
      );
    }
    setCurrentScreen('home');
    setHomeRoute('mainMenu');
    setAprendeRoute('nivelPicker');
    setActiveTab('menu');
    resetSession();
    setActiveLessonLevel(null);
    setSessionMode('lesson');
    setPendingLessonLevel(null);
  }, [resetSession]);

  const handleExitWarmupIntro = useCallback(() => {
    requestSessionExit(() => {
      resetSession();
      setSessionMode('lesson');
      setPendingLessonLevel(null);
      setCurrentScreen('home');
      if (homeRoute === 'mainMenu' || homeRoute === 'dailySession') {
        setHomeRoute('mainMenu');
        setAprendeRoute('nivelPicker');
        setActiveTab('menu');
      } else {
        setHomeRoute('aprende');
        setAprendeRoute('nivelVisualization');
        setActiveTab('aprende');
      }
    });
  }, [homeRoute, requestSessionExit, resetSession]);

  const handleExitLessonIntro = useCallback(() => {
    requestSessionExit(() => {
      resetSession();
      setActiveLessonLevel(null);
      setSessionMode('lesson');
      setCurrentScreen('home');
      setHomeRoute('aprende');
      setAprendeRoute('nivelVisualization');
      setActiveTab('aprende');
    });
  }, [requestSessionExit, resetSession]);

  const handleStartLesson = useCallback(
    (level: Level) => {
      resetLessonSession();
      setSessionMode('lesson');
      setActiveLessonLevel(level);
      goToScreen('lessonIntro');
    },
    [goToScreen, resetLessonSession],
  );

  const handleRequestStartLesson = useCallback(
    (level: Level) => {
      if (!isWarmupTokenActive()) {
        setPendingLessonLevel(level);
        resetSession();
        setSessionMode('warmup');
        goToScreen('warmupIntro');
        return;
      }
      handleStartLesson(level);
    },
    [goToScreen, handleStartLesson, isWarmupTokenActive, resetSession],
  );

  const handleStartWarmup = useCallback(() => {
    resetSession();
    setSessionMode('warmup');
    goToScreen('warmupIntro');
  }, [goToScreen, resetSession]);

  const handleWarmupIntroContinue = useCallback(() => {
    goToScreen('rotateDevice');
  }, [goToScreen]);

  const handleWarmupCompletedContinue = useCallback(() => {
    const pending = pendingLessonLevel;
    setPendingLessonLevel(null);
    resetSession();
    setSessionMode('lesson');
    setCurrentScreen('home');
    setHomeRoute('mainMenu');
    setActiveTab('menu');
    if (pending) {
      handleStartLesson(pending);
    }
  }, [handleStartLesson, pendingLessonLevel, resetSession]);

  const handleNavigateHome = useCallback(() => {
    setHomeRoute('mainMenu');
    setAprendeRoute('nivelPicker');
    setActiveTab('menu');
  }, []);

  const handleOpenProfile = useCallback(() => {
    setHomeRoute('perfil');
  }, []);

  const handleMainMenuNavigate = useCallback(
    (destination: MainMenuDestination) => {
      switch (destination) {
        case 'dailySession':
          handleStartWarmup();
          break;
        case 'aprende':
          setHomeRoute('aprende');
          setActiveTab('aprende');
          setAprendeRoute('nivelPicker');
          break;
        case 'entrena':
          setHomeRoute('entrena');
          setActiveTab('entrena');
          break;
        case 'desafios':
          setHomeRoute('desafios');
          setActiveTab('desafios');
          break;
        case 'settings':
          setSettingsVisible(true);
          break;
      }
    },
    [handleStartWarmup],
  );

  const handleTabChange = useCallback((tab: MainTab) => {
    setActiveTab(tab);
    setHomeRoute(TAB_TO_HOME_ROUTE[tab]);
    if (tab === 'aprende') {
      setAprendeRoute('nivelPicker');
    }
  }, []);

  const handleLessonComplete = useCallback(() => {
    if (activeLessonLevel) {
      completeLevel(activeLessonLevel.id);
    }
    handleGoHome();
  }, [activeLessonLevel, completeLevel, handleGoHome]);

  const handleExerciseComplete = useCallback(
    (result: {
      performances: ExerciseSessionResult['performances'];
      accuracyPercent: number;
      correctNotes: number;
      totalNotes: number;
    }) => {
      recordVocalExercise();
      const xpEarned =
        sessionMode === 'warmup' ? 0 : calculateExerciseXp(result.accuracyPercent);
      const sessionResult: ExerciseSessionResult = {
        exerciseIndex: currentExerciseIndex + 1,
        performances: result.performances,
        accuracyPercent: result.accuracyPercent,
        xpEarned,
        correctNotes: result.correctNotes,
        totalNotes: result.totalNotes,
      };
      setLastMiniResult(sessionResult);
      setSessionResults((prev) => [...prev, sessionResult]);
      if (sessionMode === 'lesson') {
        setUserProgress((prev) => addXp(prev, xpEarned));
      }
      goToScreen('exerciseMiniResult');
    },
    [currentExerciseIndex, goToScreen, recordVocalExercise, sessionMode],
  );

  const handleMiniContinue = useCallback(() => {
    const exerciseCount = getExerciseCount(sessionMode);
    if (currentExerciseIndex + 1 >= exerciseCount) {
      if (sessionMode === 'warmup') {
        completeWarmup();
        goToScreen('warmupCompleted');
      } else {
        goToScreen('lessonCompleted');
      }
      return;
    }
    setCurrentExerciseIndex((i) => i + 1);
    goToScreen('exerciseListen');
  }, [completeWarmup, currentExerciseIndex, goToScreen, sessionMode]);

  const handleRepeatLesson = useCallback(() => {
    const totalEarned = sessionResults.reduce((s, r) => s + r.xpEarned, 0);
    setUserProgress((prev) => addXp(prev, -totalEarned));
    resetLessonSession();
    goToScreen('exerciseListen');
  }, [goToScreen, resetLessonSession, sessionResults]);

  const requestExerciseExit = useCallback(() => {
    requestSessionExit(handleExitExerciseFlow);
  }, [handleExitExerciseFlow, requestSessionExit]);

  const currentExercise = getExerciseForMode(sessionMode, currentExerciseIndex);
  const lessonTotalXp = sessionResults.reduce((s, r) => s + r.xpEarned, 0);
  const lessonTotalNotes = sessionResults.reduce((s, r) => s + r.totalNotes, 0);
  const lessonHighAccuracyNotes = sessionResults.reduce(
    (sum, result) => sum + countNotesAboveAccuracy(result.performances),
    0,
  );
  const exerciseCount = getExerciseCount(sessionMode);

  const showBottomNav =
    currentScreen === 'home' && homeRoute !== 'dailySession';

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'warmupIntro':
        return (
          <WarmupIntroScreen
            onContinue={handleWarmupIntroContinue}
            onBack={handleExitWarmupIntro}
          />
        );
      case 'warmupCompleted':
        return <WarmupCompletedScreen onContinue={handleWarmupCompletedContinue} />;
      case 'lessonIntro':
        return (
          <LessonIntroScreen
            title={activeLessonLevel?.title ?? 'Lección'}
            onContinue={() => goToScreen('rotateDevice')}
            onBack={handleExitLessonIntro}
          />
        );
      case 'rotateDevice':
        return (
          <RotateDeviceScreen
            onContinue={() => goToScreen('exerciseListen')}
            onBack={requestExerciseExit}
          />
        );
      case 'exerciseListen':
        return (
          <ExerciseListenScreen
            key={`listen-${sessionMode}-${currentExerciseIndex}`}
            exerciseIndex={currentExerciseIndex + 1}
            lessonTitle={
              sessionMode === 'warmup'
                ? 'CALENTAMIENTO'
                : (currentExercise?.lessonTitle ?? 'CALENTAMIENTO')
            }
            vowelLabel={currentExercise?.vowelLabel ?? 'AA'}
            notes={currentExercise?.notes ?? []}
            vocalFrame={vocalRecorder.lastFrame}
            micReady={micReady}
            onStartExercise={() => goToScreen('vocalExercise')}
            onBack={requestExerciseExit}
          />
        );
      case 'vocalExercise':
        return (
          <VocalExerciseScreen
            exerciseIndex={currentExerciseIndex + 1}
            lessonTitle={
              sessionMode === 'warmup'
                ? 'CALENTAMIENTO'
                : (currentExercise?.lessonTitle ?? 'CALENTAMIENTO')
            }
            vowelLabel={currentExercise?.vowelLabel ?? 'AA'}
            notes={currentExercise?.notes ?? []}
            onComplete={handleExerciseComplete}
            onCancel={() => goToScreen('exerciseListen')}
            onBack={requestExerciseExit}
            vocalFrame={vocalRecorder.lastFrame}
            micReady={micReady}
          />
        );
      case 'exerciseMiniResult':
        return lastMiniResult ? (
          <ExerciseMiniResultScreen
            exerciseIndex={lastMiniResult.exerciseIndex}
            totalExerciseCount={exerciseCount}
            sessionMode={sessionMode}
            accuracyPercent={lastMiniResult.accuracyPercent}
            xpEarned={lastMiniResult.xpEarned}
            correctNotes={lastMiniResult.correctNotes}
            totalNotes={lastMiniResult.totalNotes}
            onContinue={handleMiniContinue}
            onBack={requestExerciseExit}
          />
        ) : null;
      case 'lessonCompleted':
        return (
          <LessonCompletedScreen
            totalXpEarned={lessonTotalXp}
            highAccuracyNotes={lessonHighAccuracyNotes}
            totalNotes={lessonTotalNotes}
            progressBefore={progressBeforeLesson}
            progressAfter={userProgress}
            onRepeat={handleRepeatLesson}
            onContinue={handleLessonComplete}
          />
        );
      default:
        return null;
    }
  };

  const renderHomeContent = () => {
    if (homeRoute === 'mainMenu') {
      return <MainMenuScreen onNavigate={handleMainMenuNavigate} />;
    }

    if (homeRoute === 'perfil') {
      return (
        <PlaceholderTabScreen title="Perfil" onNavigateHome={handleNavigateHome} />
      );
    }

    if (homeRoute === 'aprende') {
      if (aprendeRoute === 'nivelPicker') {
        return (
          <AprendeMenuScreen
            onOpenNivel={(nivel) => {
              setActiveSectionNivelId(nivel.id);
              setAprendeRoute('nivelVisualization');
            }}
            onNavigateHome={handleNavigateHome}
          />
        );
      }
      return (
        <NivelVisualizationScreen
          levels={levels}
          recentlyUnlockedId={recentlyUnlockedId}
          warmupTokenActive={isWarmupTokenActive()}
          streakCount={dailyState.streakCount}
          exerciseDates={dailyState.exerciseDates}
          initialSectionNivelId={activeSectionNivelId}
          onRequestStartLesson={handleRequestStartLesson}
          onStartWarmup={handleStartWarmup}
          onUnlockAnimationEnd={clearUnlockAnimation}
          onNavigateBack={() => setAprendeRoute('nivelPicker')}
        />
      );
    }

    const title =
      TAB_TITLES[homeRoute as Exclude<HomeRoute, 'mainMenu' | 'dailySession' | 'aprende' | 'perfil'>];
    return (
      <PlaceholderTabScreen title={title} onNavigateHome={handleNavigateHome} />
    );
  };

  const activeScreenContent =
    currentScreen === 'home' ? renderHomeContent() : renderActiveScreen();

  const wrappedActiveScreen =
    currentScreen !== 'home' && SLIDE_SESSION_SCREENS.has(currentScreen) ? (
      <ScreenLevelMapSlideTransition
        screenKey={currentScreen}
        direction={navDirection}
        mode={sessionExiting ? 'exit' : 'enter'}
        onExitComplete={handleExitAnimationComplete}
      >
        {activeScreenContent}
      </ScreenLevelMapSlideTransition>
    ) : (
      activeScreenContent
    );

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {currentScreen === 'home' ? (
        <HomeShell
          showBottomNav={showBottomNav}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userProgress={userProgress}
          streakActive={isStreakActive}
          streakCount={dailyState.streakCount}
          warmupTokenActive={isWarmupTokenActive()}
          onOpenSettings={() => setSettingsVisible(true)}
          onOpenProfile={handleOpenProfile}
          onLongPress={() => setResearcherPanelVisible(true)}
        >
          {renderHomeContent()}
        </HomeShell>
      ) : (
        <View style={styles.content}>{wrappedActiveScreen}</View>
      )}
      <ResearcherPanel
        visible={researcherPanelVisible}
        selectedScenario={researchScenario}
        onSelectScenario={setResearchScenario}
        onClose={() => setResearcherPanelVisible(false)}
      />
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
