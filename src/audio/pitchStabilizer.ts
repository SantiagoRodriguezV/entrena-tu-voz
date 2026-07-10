const MEDIAN_WINDOW = 3;
const EMA_ALPHA = 0.28;
const MAX_JUMP_CENTS = 55;
const VOICE_HOLD_MS = 90;

export class PitchStabilizer {
  private window: number[] = [];
  private emaHz: number | null = null;
  private lastVoiceMs = 0;
  private voiceHeld = false;

  reset(): void {
    this.window = [];
    this.emaHz = null;
    this.lastVoiceMs = 0;
    this.voiceHeld = false;
  }

  private median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private clampJump(prevHz: number, nextHz: number): number {
    const cents = 1200 * Math.log2(nextHz / prevHz);
    if (Math.abs(cents) <= MAX_JUMP_CENTS) return nextHz;
    const direction = cents > 0 ? 1 : -1;
    return prevHz * Math.pow(2, (direction * MAX_JUMP_CENTS) / 1200);
  }

  stabilize(rawHz: number | null, isVoiceActive: boolean, nowMs: number): number | null {
    if (isVoiceActive && rawHz !== null && rawHz > 0) {
      this.lastVoiceMs = nowMs;
      this.voiceHeld = true;

      this.window.push(rawHz);
      if (this.window.length > MEDIAN_WINDOW) {
        this.window.shift();
      }

      const filtered = this.median(this.window);
      const target =
        this.emaHz === null ? filtered : this.clampJump(this.emaHz, filtered);
      this.emaHz =
        this.emaHz === null
          ? target
          : this.emaHz + EMA_ALPHA * (target - this.emaHz);
      return this.emaHz;
    }

    if (this.voiceHeld && nowMs - this.lastVoiceMs < VOICE_HOLD_MS) {
      return this.emaHz;
    }

    this.voiceHeld = false;
    return null;
  }

  get isVoiceHeld(): boolean {
    return this.voiceHeld;
  }
}
