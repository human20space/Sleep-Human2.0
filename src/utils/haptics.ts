// Web Vibration API Somatic Haptics Engine
// Provides gentle tactile sensations for breathing, mindfulness resets, and tactile button feedback

class HapticsEngine {
  public enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('human2_haptics_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      // ignore
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('human2_haptics_enabled', val ? 'true' : 'false');
    } catch {
      // ignore
    }
    if (val) this.trigger('tap');
  }

  public trigger(type: 'tap' | 'inhale' | 'hold' | 'exhale' | 'finish' | 'warning') {
    if (!this.enabled) return;
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(12);
          break;
        case 'inhale':
          // Subtle rhythmic ascending micro-pulses
          navigator.vibrate([15, 60, 20, 60, 25]);
          break;
        case 'hold':
          // Grounding single sustained pulse
          navigator.vibrate(35);
          break;
        case 'exhale':
          // Soft descending settling wave
          navigator.vibrate([25, 80, 15, 100, 10]);
          break;
        case 'finish':
          // Celebratory harmonic triple tap
          navigator.vibrate([40, 60, 40, 60, 80]);
          break;
        case 'warning':
          navigator.vibrate([60, 40, 60]);
          break;
      }
    } catch (e) {
      console.warn('Haptic vibration error', e);
    }
  }
}

export const hapticsEngine = new HapticsEngine();
