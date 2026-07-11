import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setDemoScenario } from './src/audio/DemoVocalEngine';
import { countNotesAboveAccuracy } from './src/audio/accuracyUtils';
import {
  calculateExerciseXp,
  getInitialUserProgress,
  addXp,
  setUserVocalCalibration,
  UserProgress,
} from './src/audio/xpSystem';
import { clampExerciseNotesToComfort } from './src/audio/userVocalProfile';
import type { UserVocalCalibration } from './src/audio/userVocalProfile';
import { useVocalRecorder } from './src/audio/useVocalRecorder';
import { BackConfirmPanel } from './src/components/BackConfirmPanel';
import { ExitAppConfirmPanel } from './src/components/ExitAppConfirmPanel';
import { HomeShell } from './src/components/HomeShell';
import { ResearcherPanel } from './src/components/ResearcherPanel';
import { ScreenLevelMapSlideTransition } from './src/components/ScreenLevelMapSlideTransition';
import type { NavDirection } from './src/components/ScreenLevelMapSlideTransition';
import { SettingsModal } from './src/components/SettingsModal';
import { ExerciseListenScreen } from './src/screens/ExerciseListenScreen';
import { ExerciseMiniResultScreen } from './src/screens/ExerciseMiniResultScreen';
import { ExerciseReadyScreen } from './src/screens/ExerciseReadyScreen';
import { NivelVisualizationScreen } from './src/screens/NivelVisualizationScreen';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { AprendeMenuScreen } from './src/screens/AprendeMenuScreen';
import { LessonCompletedScreen } from './src/screens/LessonCompletedScreen';
import { LessonIntroScreen } from './src/screens/LessonIntroScreen';
import { PlaceholderTabScreen } from './src/screens/PlaceholderTabScreen';
import { RotateDeviceScreen } from './src/screens/RotateDeviceScreen';
import { VocalCalibrationScreen } from './src/screens/VocalCalibrationScreen';
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
  'vocalCalibration',
  'exerciseReady',
  'exerciseListen',
  'vocalExercise',
  'exerciseMiniResult',
  'warmupCompleted',
  'lessonCompleted',
]);

function goToExerciseEntry(
  exerciseIndex: number,
  goToScreen: (screen: AppScreen) => void,
): void {
  goToScreen(exerciseIndex === 0 ? 'exerciseReady' : 'exerciseListen');
}

function goToSessionAfterIntro(
  goToScreen: (screen: AppScreen) => void,
  needsCalibration: boolean,
): void {
  goToScreen(needsCalibration ? 'vocalCalibration' : 'rotateDevice');
}

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
  const [exitAppConfirmVisible, setExitAppConfirmVisible] = useState(false);
  const [sessionBackConfirmVisible, setSessionBackConfirmVisible] = useState(false);
  const [navDirection, setNavDirection] = useState<NavDirection>('forward');
  const [sessionExiting, setSessionExiting] = useState(false);
  const pendingExitActionRef = useRef<(() => void) | null>(null);
  const pendingSessionBackActionRef = useRef<(() => void) | null>(null);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<ExerciseSessionResult[]>([]);
  const [lastMiniResult, setLastMiniResult] = useState<ExerciseSessionResult | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(getInitialUserProgress());
  const [progressBeforeLesson, setProgressBeforeLesson] = useState<UserProgress>(
    getInitialUserProgress(),
  );
  /** When true, calibration was opened from settings and should return home. */
  const [calibrationFromSettings, setCalibrationFromSettings] = useState(false);

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
    if (
      currentScreen === 'exerciseListen' ||
      currentScreen === 'vocalExercise' ||
      currentScreen === 'vocalCalibration'
    ) {
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

    resetSession();
    setActiveLessonLevel(null);
    setPendingLessonLevel(null);
    setSessionMode('lesson');
    setNavDirection('back');
    setCurrentScreen('home');
    setHomeRoute('aprende');
    // Mapa de Aprendizaje / menú de selección de lecciones
    setAprendeRoute('nivelVisualization');
    setActiveTab('aprende');
  }, [resetSession]);

  const handleRestartSession = useCallback(() => {
    resetSession();
    goToExerciseEntry(0, goToScreen);
  }, [goToScreen, resetSession]);

  const handleStartVocalExercise = useCallback(() => {
    goToScreen('vocalExercise');
  }, [goToScreen]);

  const handleCalibrationComplete = useCallback(
    (calibration: UserVocalCalibration) => {
      setUserProgress((prev) => setUserVocalCalibration(prev, calibration));
      if (calibrationFromSettings) {
        setCalibrationFromSettings(false);
        setCurrentScreen('home');
        setHomeRoute('mainMenu');
        setActiveTab('menu');
        return;
      }
      goToScreen('rotateDevice');
    },
    [calibrationFromSettings, goToScreen],
  );

  const handleCalibrationSkip = useCallback(() => {
    if (calibrationFromSettings) {
      setCalibrationFromSettings(false);
      setCurrentScreen('home');
      setHomeRoute('mainMenu');
      setActiveTab('menu');
      return;
    }
    goToScreen('rotateDevice');
  }, [calibrationFromSettings, goToScreen]);

  const handleRecalibrateFromSettings = useCallback(() => {
    setSettingsVisible(false);
    setCalibrationFromSettings(true);
    setUserProgress((prev) => setUserVocalCalibration(prev, null));
    goToScreen('vocalCalibration');
  }, [goToScreen]);

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
      setHomeRoute('mainMenu');
      setAprendeRoute('nivelPicker');
      setActiveTab('menu');
    });
  }, [requestSessionExit, resetSession]);

  const handleExitLessonIntro = useCallback(() => {
    requestSessionExit(() => {
      resetSession();
      setActiveLessonLevel(null);
      setSessionMode('lesson');
      setCurrentScreen('home');
      setHomeRoute('mainMenu');
      setAprendeRoute('nivelPicker');
      setActiveTab('menu');
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
    goToSessionAfterIntro(goToScreen, !userProgress.vocalCalibration);
  }, [goToScreen, userProgress.vocalCalibration]);

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
    goToExerciseEntry(0, goToScreen);
  }, [goToScreen, resetLessonSession, sessionResults]);

  const requestExerciseExit = useCallback(() => {
    requestSessionExit(handleExitExerciseFlow);
  }, [handleExitExerciseFlow, requestSessionExit]);

  const requestConfirmedSessionBack = useCallback((action: () => void) => {
    pendingSessionBackActionRef.current = action;
    setSessionBackConfirmVisible(true);
  }, []);

  const handleConfirmSessionBack = useCallback(() => {
    const action = pendingSessionBackActionRef.current;
    pendingSessionBackActionRef.current = null;
    setSessionBackConfirmVisible(false);
    action?.();
  }, []);

  const handleDismissSessionBack = useCallback(() => {
    pendingSessionBackActionRef.current = null;
    setSessionBackConfirmVisible(false);
  }, []);

  const handleAndroidBack = useCallback(() => {
    if (exitAppConfirmVisible) {
      setExitAppConfirmVisible(false);
      return true;
    }

    if (sessionBackConfirmVisible) {
      handleDismissSessionBack();
      return true;
    }

    if (settingsVisible) {
      setSettingsVisible(false);
      return true;
    }

    if (researcherPanelVisible) {
      setResearcherPanelVisible(false);
      return true;
    }

    if (sessionExiting) {
      return true;
    }

    if (currentScreen === 'home') {
      if (homeRoute === 'mainMenu') {
        setExitAppConfirmVisible(true);
        return true;
      }

      if (homeRoute === 'aprende' && aprendeRoute === 'nivelVisualization') {
        setAprendeRoute('nivelPicker');
        return true;
      }

      handleNavigateHome();
      return true;
    }

    switch (currentScreen) {
      case 'warmupIntro':
        requestConfirmedSessionBack(handleExitWarmupIntro);
        return true;
      case 'lessonIntro':
        requestConfirmedSessionBack(handleExitLessonIntro);
        return true;
      case 'rotateDevice':
      case 'vocalCalibration':
      case 'exerciseReady':
      case 'exerciseListen':
      case 'vocalExercise':
      case 'exerciseMiniResult':
        requestConfirmedSessionBack(requestExerciseExit);
        return true;
      case 'warmupCompleted':
        handleWarmupCompletedContinue();
        return true;
      case 'lessonCompleted':
        handleLessonComplete();
        return true;
      default:
        return true;
    }
  }, [
    aprendeRoute,
    currentScreen,
    exitAppConfirmVisible,
    handleDismissSessionBack,
    handleExitLessonIntro,
    handleExitWarmupIntro,
    handleLessonComplete,
    handleNavigateHome,
    handleWarmupCompletedContinue,
    homeRoute,
    requestConfirmedSessionBack,
    requestExerciseExit,
    researcherPanelVisible,
    sessionBackConfirmVisible,
    sessionExiting,
    settingsVisible,
  ]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleAndroidBack,
    );
    return () => subscription.remove();
  }, [handleAndroidBack]);

  const currentExercise = useMemo(() => {
    const raw = getExerciseForMode(sessionMode, currentExerciseIndex);
    if (!raw) return null;
    return {
      ...raw,
      notes: clampExerciseNotesToComfort(
        raw.notes,
        userProgress.vocalCalibration,
        userProgress.voiceTypeId,
      ),
    };
  }, [
    sessionMode,
    currentExerciseIndex,
    userProgress.vocalCalibration,
    userProgress.voiceTypeId,
  ]);
  const comfortDb = userProgress.vocalCalibration?.comfortDb ?? null;
  const lessonTotalXp = sessionResults.reduce((s, r) => s + r.xpEarned, 0);
  const lessonTotalNotes = sessionResults.reduce((s, r) => s + r.totalNotes, 0);
  const lessonHighAccuracyNotes = sessionResults.reduce(
    (sum, result) => sum + countNotesAboveAccuracy(result.performances),
    0,
  );
  const exerciseCount = getExerciseCount(sessionMode);
  const sessionScore = sessionResults.reduce((s, r) => s + r.accuracyPercent, 0);
  const sessionLessonTitle =
    sessionMode === 'warmup'
      ? 'CALENTAMIENTO'
      : (currentExercise?.lessonTitle ?? 'ENTRENAMIENTO VOCAL');

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
            onContinue={() =>
              goToSessionAfterIntro(goToScreen, !userProgress.vocalCalibration)
            }
            onBack={handleExitLessonIntro}
          />
        );
      case 'rotateDevice':
        return (
          <RotateDeviceScreen
            onContinue={() => goToExerciseEntry(currentExerciseIndex, goToScreen)}
            onBack={requestExerciseExit}
          />
        );
      case 'vocalCalibration':
        return (
          <VocalCalibrationScreen
            vocalFrame={vocalRecorder.lastFrame}
            micReady={micReady}
            onComplete={handleCalibrationComplete}
            onSkip={handleCalibrationSkip}
            onBack={
              calibrationFromSettings
                ? () => {
                    setCalibrationFromSettings(false);
                    setCurrentScreen('home');
                    setHomeRoute('mainMenu');
                    setActiveTab('menu');
                  }
                : requestExerciseExit
            }
          />
        );
      case 'exerciseReady':
        return (
          <ExerciseReadyScreen
            onContinue={() => goToScreen('exerciseListen')}
          />
        );
      case 'exerciseListen':
        return (
          <ExerciseListenScreen
            key={`listen-${sessionMode}-${currentExerciseIndex}`}
            exerciseIndex={currentExerciseIndex + 1}
            lessonTitle={sessionLessonTitle}
            vowelLabel={currentExercise?.vowelLabel ?? 'AA'}
            notes={currentExercise?.notes ?? []}
            vocalFrame={vocalRecorder.lastFrame}
            micReady={micReady}
            sessionScore={sessionScore}
            onStartExercise={handleStartVocalExercise}
            onBack={requestExerciseExit}
            onRestartSession={handleRestartSession}
            onExitToLessonMenu={handleExitExerciseFlow}
          />
        );
      case 'vocalExercise':
        return (
          <VocalExerciseScreen
            exerciseIndex={currentExerciseIndex + 1}
            lessonTitle={sessionLessonTitle}
            vowelLabel={currentExercise?.vowelLabel ?? 'AA'}
            notes={currentExercise?.notes ?? []}
            sessionScore={sessionScore}
            comfortDb={comfortDb}
            onComplete={handleExerciseComplete}
            onCancel={() => goToScreen('exerciseListen')}
            onBack={requestExerciseExit}
            onRestartSession={handleRestartSession}
            onExitToLessonMenu={handleExitExerciseFlow}
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
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
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
        <SettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          onRecalibrateVoice={handleRecalibrateFromSettings}
        />
        <ExitAppConfirmPanel
          visible={exitAppConfirmVisible}
          onDismiss={() => setExitAppConfirmVisible(false)}
          onConfirm={() => BackHandler.exitApp()}
        />
        <BackConfirmPanel
          visible={sessionBackConfirmVisible}
          onDismiss={handleDismissSessionBack}
          onConfirm={handleConfirmSessionBack}
        />
      </View>
    </SafeAreaProvider>
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
