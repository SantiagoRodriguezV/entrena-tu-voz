/** Umbrales editables para el análisis básico del micrófono (iteración 2). */
export const audioThresholds = {
  /** Duración mínima aceptable en ms (de 8000 ms totales). */
  minCompletedDurationMs: 6000,
  /** Nivel de entrada mínimo promedio (0–1). */
  minAverageInputLevel: 0.15,
  /** Nivel por debajo del cual se considera silencio. */
  silenceLevelThreshold: 0.08,
  /** Máximo de muestras silenciosas permitidas antes de marcar hadLongSilences. */
  maxSilentSamplesRatio: 0.35,
  /** Duración total del ejercicio en segundos. */
  exerciseDurationSeconds: 8,
  /** Cuenta regresiva antes de grabar. */
  countdownSeconds: 3,
  /** Umbral de volumen alto en dB (simulado/visual). */
  loudVolumeDb: 85,
};
