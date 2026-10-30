/**
 * Gentle Web Audio Synthesizer for live score event chimes.
 * Requires zero external MP3 assets, zero latency, and zero bandwidth.
 */
class SoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a pleasant 2-tone melodic chime (A5 -> E6)
   */
  public playScoreChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // First tone (880 Hz - A5)
      osc.frequency.setValueAtTime(880, now);
      // Second harmonic tone (1318.5 Hz - E6)
      osc.frequency.setValueAtTime(1318.5, now + 0.08);

      // Smooth decay envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio autoplay gracefully handled
    }
  }
}

export const soundService = new SoundService();
