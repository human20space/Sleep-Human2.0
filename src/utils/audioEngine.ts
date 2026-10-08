// Web Audio API Ambient & Chime Synthesizer
// Provides offline, instant, zero-latency calming audio cues

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  public isPlayingAmbient: boolean = false;
  public activeSoundType: string | null = null;

  // Dedicated procedural nodes
  private noiseNode: AudioNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a resonant Tibetan Singing Bowl chime
  public playBowlChime(freq: number = 320, duration: number = 4) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const harmonics = [1, 2.01, 3.02, 4.05];
      const gains = [0.4, 0.15, 0.08, 0.03];

      harmonics.forEach((mult, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * mult, now);
        osc.frequency.linearRampToValueAtTime(freq * mult * 0.998, now + duration);

        gain.gain.setValueAtTime(gains[index], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Play a soft inhale/exhale breath chime
  public playBreathChime(type: 'inhale' | 'exhale' | 'hold') {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = type === 'inhale' ? 260 : type === 'hold' ? 330 : 210;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, now + 1.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.6);
    } catch (e) {
      console.warn('Audio breath chime error', e);
    }
  }

  // Continuous Solfeggio frequency tone (432Hz Stillness or 528Hz Cellular Clarity)
  public toggleSolfeggioTone(frequency: 432 | 528 = 432): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isPlayingAmbient && this.activeSoundType === `solfeggio_${frequency}`) {
      this.stopProceduralSound();
      return false;
    }

    this.stopProceduralSound();

    try {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.12, now + 2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 1.5, now);

      this.ambientGain.connect(filter);
      filter.connect(this.ctx.destination);

      // Fundamental and gentle harmonic octaves
      const chord = [frequency * 0.5, frequency, frequency * 1.5];
      this.ambientOscs = chord.map((f) => {
        if (!this.ctx) throw new Error('No ctx');
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(this.ambientGain!);
        osc.start(now);
        return osc;
      });

      this.isPlayingAmbient = true;
      this.activeSoundType = `solfeggio_${frequency}`;
      return true;
    } catch (e) {
      console.warn('Solfeggio tone start error', e);
      return false;
    }
  }

  // Delta wave binaural beat generator (e.g., 200Hz Left + 202Hz Right = 2Hz Delta)
  public toggleBinauralBeat(carrierFreq: number = 200, beatFreq: number = 2): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isPlayingAmbient && this.activeSoundType === 'delta_binaural') {
      this.stopProceduralSound();
      return false;
    }

    this.stopProceduralSound();

    try {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.1, now + 2);

      const merger = this.ctx.createChannelMerger(2);

      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(carrierFreq, now);

      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(carrierFreq + beatFreq, now);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      merger.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      oscL.start(now);
      oscR.start(now);

      this.ambientOscs = [oscL, oscR];
      this.isPlayingAmbient = true;
      this.activeSoundType = 'delta_binaural';
      return true;
    } catch (e) {
      console.warn('Binaural beat error', e);
      return false;
    }
  }

  // Filtered Pink Noise Ocean Rain Synthesizer (100% offline procedural)
  public toggleOceanRainNoise(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isPlayingAmbient && this.activeSoundType === 'ocean_rain') {
      this.stopProceduralSound();
      return false;
    }

    this.stopProceduralSound();

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate pink noise approximation (Paul Kellet's algorithm)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      // Lowpass resonant filter simulating ocean precipitation
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      whiteNoise.start();
      this.noiseNode = whiteNoise;
      this.isPlayingAmbient = true;
      this.activeSoundType = 'ocean_rain';
      return true;
    } catch (e) {
      console.warn('Ocean rain noise error', e);
      return false;
    }
  }

  // 90-Second Acute SOS Racing Mind Pacer
  public playSosBreathPacer(): boolean {
    this.playBowlChime(432, 3);
    return this.toggleSolfeggioTone(432);
  }

  // General Drone alias for backwards compatibility
  public toggleAmbientDrone(): boolean {
    return this.toggleSolfeggioTone(432);
  }

  // Gracefully stop all procedural audio
  public stopProceduralSound() {
    if (!this.ctx || !this.ambientGain) {
      this.isPlayingAmbient = false;
      this.activeSoundType = null;
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
      setTimeout(() => {
        this.ambientOscs.forEach((o) => {
          try { o.stop(); o.disconnect(); } catch { /* ignore */ }
        });
        if (this.noiseNode) {
          try { (this.noiseNode as AudioBufferSourceNode).stop(); this.noiseNode.disconnect(); } catch { /* ignore */ }
          this.noiseNode = null;
        }
        this.ambientOscs = [];
        this.isPlayingAmbient = false;
        this.activeSoundType = null;
      }, 1300);
    } catch (e) {
      console.warn('Procedural stop error', e);
      this.isPlayingAmbient = false;
      this.activeSoundType = null;
    }
  }

  public stopAmbientDrone() {
    this.stopProceduralSound();
  }

  public stopDrone() {
    this.stopProceduralSound();
  }
}

export const audioEngine = new AudioEngine();
