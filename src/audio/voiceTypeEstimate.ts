/**
 * Re-exports voice-type estimation helpers for audio/evaluation call sites.
 */
export {
  estimateVoiceTypeFromExtent,
  estimateVoiceTypeFromSamples,
  getBeginnerExerciseBand,
  getBeginnerTrainingBand,
  getVoiceType,
  isHzInBand,
  isOutsideTessitura,
  VOICE_TYPE_IDS,
  VOICE_TYPE_RANGES,
  type HzBand,
  type VoiceTypeId,
  type VoiceTypeRange,
} from '../data/voiceTypeRanges';
