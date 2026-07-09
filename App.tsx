import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { setDemoScenario } from './src/audio/DemoVocalEngine';
import {
  calculateExerciseXp,
  getInitialUserProgress,
  addXp,
  UserProgress,
} from './src/audio/xpSystem';
import { useVocalRecorder } from './src/audio/useVocalRecorder';
import { BottomNavBar } from './src/components/BottomNavBar';
import { ResearcherPanel } from './src/components/ResearcherPanel';
import { SettingsModal } from './src/components/SettingsModal';
import { ExerciseListenScreen } from './src/screens/ExerciseListenScreen';
import { ExerciseMiniResultScreen } from './src/screens/ExerciseMiniResultScreen';
import { HomeMapScreen } from './src/screens/HomeMapScreen';
import { LessonCompletedScreen } from './src/screens/LessonCompletedScreen';
import { LessonIntroScreen } from './src/screens/LessonIntroScreen';
import { PlaceholderTabScreen } from './src/screens/PlaceholderTabScreen';
import { RotateDeviceScreen } from './src/screens/RotateDeviceScreen';
import { VocalExerciseScreen } from './src/screens/VocalExerciseScreen';
import { getLessonExercise, LESSON_EXERCISE_COUNT } from './src/data/lessonExercises';
import { useLevelProgress } from './src/hooks/useLevelProgress';
import {
  AppScreen,
  DemoScenario,
  ExerciseSessionResult,
  Level,
  MainTab,
} from './src/types/exercise';
import { colors } from './src/theme/colors';

const TAB_TITLES: Record<Exclude<MainTab, 'entrena'>, string> = {
  desafios: 'Desafíos',
  aprende: 'Aprende',
  perfil: 'Perfil',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [activeTab, setActiveTab] = useState<MainTab>('entrena');
  const [activeLessonLevel, setActiveLessonLevel] = useState<Level | null>(null);
  const [researchScenario, setResearchScenario] = useState<DemoScenario>('good');
  const [researcherPanelVisible, setResearcherPanelVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

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

  const vocalRecorder = useVocalRecorder();

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

  const resetLessonSession = useCallback(() => {
    setCurrentExerciseIndex(0);
    setSessionResults([]);
    setLastMiniResult(null);
    setProgressBeforeLesson(userProgress);
  }, [userProgress]);

  const handleGoHome = useCallback(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
        () => {},
      );
    }
    setCurrentScreen('home');
    setActiveTab('entrena');
    resetLessonSession();
    setActiveLessonLevel(null);
  }, [resetLessonSession]);

  const handleStartLesson = useCallback(
    (level: Level) => {
      resetLessonSession();
      setActiveLessonLevel(level);
      setCurrentScreen('lessonIntro');
    },
    [resetLessonSession],
  );

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
      const xpEarned = calculateExerciseXp(result.accuracyPercent);
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
      setUserProgress((prev) => addXp(prev, xpEarned));
      setCurrentScreen('exerciseMiniResult');
    },
    [currentExerciseIndex],
  );

  const handleMiniContinue = useCallback(() => {
    if (currentExerciseIndex + 1 >= LESSON_EXERCISE_COUNT) {
      setCurrentScreen('lessonCompleted');
      return;
    }
    setCurrentExerciseIndex((i) => i + 1);
    setCurrentScreen('exerciseListen');
  }, [currentExerciseIndex]);

  const handleRepeatLesson = useCallback(() => {
    const totalEarned = sessionResults.reduce((s, r) => s + r.xpEarned, 0);
    setUserProgress((prev) => addXp(prev, -totalEarned));
    resetLessonSession();
    setCurrentScreen('exerciseListen');
  }, [resetLessonSession, sessionResults]);

  const currentExercise = getLessonExercise(currentExerciseIndex);
  const lessonTotalXp = sessionResults.reduce((s, r) => s + r.xpEarned, 0);
  const lessonCorrectNotes = sessionResults.reduce((s, r) => s + r.correctNotes, 0);
  const lessonTotalNotes = sessionResults.reduce((s, r) => s + r.totalNotes, 0);

  const showBottomNav = currentScreen === 'home';

  const renderLessonScreen = () => {
    switch (currentScreen) {
      case 'lessonIntro':
        return (
          <LessonIntroScreen
            title={activeLessonLevel?.title ?? 'Lección'}
            onContinue={() => setCurrentScreen('rotateDevice')}
            onBack={handleGoHome}
          />
        );
      case 'rotateDevice':
        return (
          <RotateDeviceScreen onContinue={() => setCurrentScreen('exerciseListen')} />
        );
      case 'exerciseListen':
        return (
          <ExerciseListenScreen
            key={`listen-${currentExerciseIndex}`}
            exerciseIndex={currentExerciseIndex + 1}
            lessonTitle={currentExercise?.lessonTitle ?? 'CALENTAMIENTO'}
            vowelLabel={currentExercise?.vowelLabel ?? 'AA'}
            notes={currentExercise?.notes ?? []}
            vocalFrame={vocalRecorder.lastFrame}
            micReady={micReady}
            onStartExercise={() => setCurrentScreen('vocalExercise')}
          />
        );
      case 'vocalExercise':
        return (
          <VocalExerciseScreen
            exerciseIndex={currentExerciseIndex + 1}
            lessonTitle={currentExercise?.lessonTitle ?? 'CALENTAMIENTO'}
            vowelLabel={currentExercise?.vowelLabel ?? 'AA'}
            notes={currentExercise?.notes ?? []}
            onComplete={handleExerciseComplete}
            onCancel={() => setCurrentScreen('exerciseListen')}
            vocalFrame={vocalRecorder.lastFrame}
            micReady={micReady}
          />
        );
      case 'exerciseMiniResult':
        return lastMiniResult ? (
          <ExerciseMiniResultScreen
            exerciseIndex={lastMiniResult.exerciseIndex}
            accuracyPercent={lastMiniResult.accuracyPercent}
            xpEarned={lastMiniResult.xpEarned}
            correctNotes={lastMiniResult.correctNotes}
            totalNotes={lastMiniResult.totalNotes}
            onContinue={handleMiniContinue}
          />
        ) : null;
      case 'lessonCompleted':
        return (
          <LessonCompletedScreen
            totalXpEarned={lessonTotalXp}
            totalCorrectNotes={lessonCorrectNotes}
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
    if (activeTab === 'entrena') {
      return (
        <HomeMapScreen
          levels={levels}
          recentlyUnlockedId={recentlyUnlockedId}
          userProgress={userProgress}
          onStartLesson={handleStartLesson}
          onOpenSettings={() => setSettingsVisible(true)}
          onOpenResearcher={() => setResearcherPanelVisible(true)}
          onUnlockAnimationEnd={clearUnlockAnimation}
        />
      );
    }
    const title = TAB_TITLES[activeTab];
    return <PlaceholderTabScreen title={title} />;
  };

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
      <View style={styles.content}>
        {currentScreen === 'home' ? renderHomeContent() : renderLessonScreen()}
      </View>
      {showBottomNav && (
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
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
