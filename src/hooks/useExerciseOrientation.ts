import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AppScreen } from '../types/exercise';

const LANDSCAPE_SCREENS = new Set<AppScreen>([
  'exerciseListen',
  'vocalExercise',
  'exerciseMiniResult',
]);

const PORTRAIT_SCREENS = new Set<AppScreen>([
  'home',
  'warmupIntro',
  'lessonIntro',
  'warmupCompleted',
  'lessonCompleted',
]);

export function useExerciseOrientation(currentScreen: AppScreen) {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    if (LANDSCAPE_SCREENS.has(currentScreen)) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(
        () => {},
      );
      return;
    }

    if (PORTRAIT_SCREENS.has(currentScreen)) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
        () => {},
      );
    }
  }, [currentScreen]);
}

export async function lockLandscapeOrientation(): Promise<void> {
  if (Platform.OS === 'web') return;
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(
    () => {},
  );
}

export async function lockPortraitOrientation(): Promise<void> {
  if (Platform.OS === 'web') return;
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
    () => {},
  );
}
