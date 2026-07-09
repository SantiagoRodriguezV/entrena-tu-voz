import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getLatestVocalFrame,
  isRealVocalEngineSupported,
  startRealVocalEngine,
  stopRealVocalEngine,
  subscribeRealVocalEngine,
} from './RealVocalEngine';
import { VocalFrame } from '../types/exercise';

type VocalRecorderState = {
  isAvailable: boolean;
  isRecording: boolean;
  permissionGranted: boolean;
  lastFrame: VocalFrame | null;
  start: () => Promise<boolean>;
  stop: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
};

export function useVocalRecorder(): VocalRecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [lastFrame, setLastFrame] = useState<VocalFrame | null>(null);
  const isAvailable = isRealVocalEngineSupported();

  const start = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false;
    const ok = await startRealVocalEngine();
    setIsRecording(ok);
    setPermissionGranted(ok);
    return ok;
  }, [isAvailable]);

  const stop = useCallback(async (): Promise<void> => {
    await stopRealVocalEngine();
    setIsRecording(false);
    setLastFrame(null);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const ok = await start();
    if (ok) await stop();
    setPermissionGranted(ok);
    return ok;
  }, [start, stop]);

  useEffect(() => {
    if (!isRecording) return;

    const unsub = subscribeRealVocalEngine((frame) => {
      setLastFrame(frame);
    });

    const poll = setInterval(() => {
      const frame = getLatestVocalFrame();
      if (frame) setLastFrame(frame);
    }, 50);

    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopRealVocalEngine();
    };
  }, []);

  return useMemo(
    () => ({
      isAvailable,
      isRecording,
      permissionGranted,
      lastFrame,
      start,
      stop,
      requestPermission,
    }),
    [isAvailable, isRecording, permissionGranted, lastFrame, start, stop, requestPermission],
  );
}
