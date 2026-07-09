import { audioThresholds } from '../audio/audioThresholds';
import {
  BasicAudioMetrics,
  ResearchScenario,
  VocalAnalysisResult,
  VocalResultType,
} from '../types/vocalAnalysis';

const SCENARIO_PRESETS: Record<ResearchScenario, VocalAnalysisResult> = {
  successful: {
    voiceDetected: true,
    durationScore: 0.95,
    pitchDirectionScore: 0.92,
    continuityScore: 0.88,
    registerTransitionScore: 0.9,
    effortWarning: false,
    confidence: 0.91,
    resultType: 'successful',
  },
  partial: {
    voiceDetected: true,
    durationScore: 0.88,
    pitchDirectionScore: 0.85,
    continuityScore: 0.58,
    registerTransitionScore: 0.72,
    effortWarning: false,
    confidence: 0.78,
    resultType: 'partial',
  },
  insufficient_audio: {
    voiceDetected: false,
    durationScore: 0.2,
    pitchDirectionScore: 0.15,
    continuityScore: 0.1,
    registerTransitionScore: 0.1,
    effortWarning: false,
    confidence: 0.65,
    resultType: 'insufficient_audio',
  },
  interrupted: {
    voiceDetected: true,
    durationScore: 0.45,
    pitchDirectionScore: 0.6,
    continuityScore: 0.35,
    registerTransitionScore: 0.4,
    effortWarning: false,
    confidence: 0.72,
    resultType: 'interrupted',
  },
  possible_effort: {
    voiceDetected: true,
    durationScore: 0.82,
    pitchDirectionScore: 0.55,
    continuityScore: 0.62,
    registerTransitionScore: 0.48,
    effortWarning: true,
    confidence: 0.74,
    resultType: 'possible_effort',
  },
};

function deriveBasicResultType(metrics: BasicAudioMetrics): VocalResultType {
  if (!metrics.voiceDetected) {
    return 'insufficient_audio';
  }
  if (metrics.completedDuration < audioThresholds.minCompletedDurationMs) {
    return 'interrupted';
  }
  if (metrics.hadLongSilences || metrics.averageInputLevel < audioThresholds.minAverageInputLevel) {
    return 'partial';
  }
  return 'successful';
}

/**
 * Motor simulado del coach vocal. En iteración 1 el escenario del investigador
 * controla el resultado pedagógico; los datos básicos se mezclan cuando existen.
 */
export function analyzeVocalPerformance(
  scenario: ResearchScenario,
  basicMetrics?: BasicAudioMetrics,
): VocalAnalysisResult {
  const preset = SCENARIO_PRESETS[scenario];

  if (!basicMetrics) {
    return { ...preset };
  }

  const basicResultType = deriveBasicResultType(basicMetrics);

  return {
    ...preset,
    voiceDetected: basicMetrics.voiceDetected,
    durationScore:
      basicMetrics.completedDuration / basicMetrics.exerciseDurationMs,
    resultType: preset.resultType,
    confidence:
      preset.resultType === basicResultType
        ? preset.confidence
        : Math.min(preset.confidence, 0.85),
  };
}

export function getScenarioLabel(scenario: ResearchScenario): string {
  const labels: Record<ResearchScenario, string> = {
    successful: 'Ejecución lograda',
    partial: 'Ejecución parcialmente lograda',
    insufficient_audio: 'Audio insuficiente',
    interrupted: 'Emisión interrumpida',
    possible_effort: 'Posible exceso de esfuerzo',
  };
  return labels[scenario];
}
