/** Empty frame used when mic has not emitted yet. */
export function createEmptyVocalFrame(timeMs = 0) {
  return {
    timeMs,
    detectedHz: null,
    rawHz: null,
    pitchConfidence: 0,
    relativeDb: null,
    volumeDb: null,
    volumeCategory: 'low' as const,
    isVoiceActive: false,
    harmonicityScore: null,
    noiseRatioProxy: null,
    stabilityScore: null,
    clippingDetected: false,
    captureConfidence: 0,
  };
}
