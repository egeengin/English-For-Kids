/**
 * Procedural Web Audio API sound synthesizer.
 * Generates tactile Lego brick snaps, sparkles, chimes, and celebrations offline.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}



/**
 * Tactile plastic Lego click/snap sound
 */
export function playLegoSnap(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Sharp click transient
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.Q.setValueAtTime(3, now);

  gain.gain.setValueAtTime(0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);

  // Secondary plastic resonance
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(820, now + 0.01);
  osc2.frequency.exponentialRampToValueAtTime(300, now + 0.07);

  gain2.gain.setValueAtTime(0.3, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.01);
  osc2.stop(now + 0.07);
}

/**
 * Cheerful success chime (C5 -> E5 -> G5 -> C6 arpeggio)
 */
export function playSuccessChime(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.25, now + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.35);
  });
}

/**
 * Gentle, encouraging wobble/boing sound for incorrect retry
 */
export function playGentleWobble(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.linearRampToValueAtTime(180, now + 0.15);
  osc.frequency.linearRampToValueAtTime(220, now + 0.25);
  osc.frequency.linearRampToValueAtTime(140, now + 0.4);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
}

/**
 * Short, gentle double-pulse ("dı-dıt") for quick incorrect selection feedback
 */
export function playDiDit(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // First pulse: "dı" (~220Hz, gentle sine, 0.07s)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(220, now);
  osc1.frequency.exponentialRampToValueAtTime(175, now + 0.07);

  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.07);

  // Second pulse: "dıt" (~160Hz, gentle sine, 0.08s, after a 0.04s gap)
  const t2 = now + 0.11;
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(165, t2);
  osc2.frequency.exponentialRampToValueAtTime(130, t2 + 0.08);

  gain2.gain.setValueAtTime(0.25, t2);
  gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.08);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(t2);
  osc2.stop(t2 + 0.08);
}

/**
 * Star collect sparkle sound
 */
export function playStarSparkle(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const pitches = [880, 1174.66, 1396.91, 1760];

  pitches.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    gain.gain.setValueAtTime(0.2, now + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.25);
  });
}

/**
 * Level complete victory fanfare
 */
export function playFanfare(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Trumpet-like chords
  const chords = [
    { time: 0.00, notes: [523.25, 659.25], dur: 0.18 },
    { time: 0.20, notes: [523.25, 659.25], dur: 0.18 },
    { time: 0.40, notes: [523.25, 659.25], dur: 0.18 },
    { time: 0.65, notes: [659.25, 783.99, 1046.50], dur: 0.70 }
  ];

  chords.forEach(c => {
    c.notes.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + c.time);

      gain.gain.setValueAtTime(0.2, now + c.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + c.time + c.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + c.time);
      osc.stop(now + c.time + c.dur);
    });
  });
}

/**
 * Subtle UI button tap
 */
export function playTap(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * Walkie-talkie 2-tone radio transmission chirp
 */
export function playRadioBeep(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Tone 1: 880 Hz (A5)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, now);
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.07);

  // Tone 2: 1760 Hz (A6, octave higher)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1760, now + 0.07);
  gain2.gain.setValueAtTime(0.25, now + 0.07);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.07);
  osc2.stop(now + 0.16);
}

// Aliases for convenience
export function playSnap(isMuted = false) { return playLegoSnap(isMuted); }
export function playVictoryFanfare(isMuted = false) { return playFanfare(isMuted); }
export function playSparkle(isMuted = false) { return playStarSparkle(isMuted); }
export function playSuccess(isMuted = false) { return playSuccessChime(isMuted); }
export function playWobble(isMuted = false) { return playGentleWobble(isMuted); }
export function playWrong(isMuted = false) { return playDiDit(isMuted); }

/**
 * Bouncy cartoon spring boing sound
 */
export function playBoing(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.1);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.31);

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}

/**
 * Rapid chirpy giggle hops when Leo is tickled or celebrating
 */
export function playGiggle(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const hops = [620, 760, 900, 1080];
  hops.forEach((freq, idx) => {
    const t = now + idx * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, t + 0.045);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  });
}

/**
 * Bright, playful cartoon duck-quack / slide-whistle double chirp (clean triangle + sine waves)
 */
export function playSillyToot(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [0, 0.11].forEach((offset, idx) => {
    const t = now + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(idx === 0 ? 520 : 660, t);
    osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 340 : 490, t + 0.085);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.095);
  });
}

/**
 * Bubbly cork pop for funny clicks & hat swaps
 */
export function playComicPop(isMuted = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(780, now + 0.075);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.09);
}

// Cheerful upbeat Web Audio Kids Song Synthesizer (marimba melody + bass + beat)
let songTimerId = null;
let songStepIndex = 0;

const MELODY_PATTERNS = [
  // Catchy major pentatonic kids pop groove (Hz, null = rest)
  [523.25, null, 659.25, 783.99, 880.0, null, 783.99, 659.25, 587.33, null, 659.25, 783.99, 659.25, null, 523.25, null],
  [523.25, 587.33, 659.25, null, 783.99, null, 880.0, 783.99, 698.46, null, 659.25, 587.33, 523.25, null, 783.99, null],
  [659.25, null, 783.99, 880.0, 1046.5, null, 880.0, 783.99, 698.46, 659.25, 587.33, null, 523.25, 659.25, 523.25, null],
];

const BASS_PATTERN = [
  130.81, null, null, null, 196.0, null, null, null,
  174.61, null, null, null, 196.0, null, 130.81, null,
];

function triggerKick(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(135, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.14);
}

function triggerClap(ctx, now) {
  const bufferSize = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.Q.setValueAtTime(1.2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

function triggerMarimbaNote(ctx, freq, now, duration = 0.22, volume = 0.18) {
  const osc = ctx.createOscillator();
  const overtone = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  overtone.type = 'sine';
  overtone.frequency.setValueAtTime(freq * 2, now);

  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(0.05, now);
  overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  overtone.connect(overtoneGain);
  overtoneGain.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  overtone.start(now);
  osc.stop(now + duration + 0.02);
  overtone.stop(now + duration + 0.02);
}

export function stopKidsSongBeat() {
  if (songTimerId) {
    clearInterval(songTimerId);
    songTimerId = null;
  }
  songStepIndex = 0;
}

export function startKidsSongBeat(isMuted = false, patternIdx = 0, onBeatStep = null) {
  stopKidsSongBeat();
  if (isMuted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const melody = MELODY_PATTERNS[patternIdx % MELODY_PATTERNS.length];
  const stepMs = 235; // ~128 BPM eighth-note groove

  const tick = () => {
    const step = songStepIndex % 16;
    const now = ctx.currentTime;

    // Kick on 0, 4, 8, 12; cheerful clap on 4, 12 (backbeat) & light tick on offbeats
    if (step % 4 === 0) {
      triggerKick(ctx, now);
    }
    if (step === 4 || step === 12) {
      triggerClap(ctx, now);
    }

    const bassFreq = BASS_PATTERN[step];
    if (bassFreq) {
      triggerMarimbaNote(ctx, bassFreq, now, 0.32, 0.16);
    }

    const melodyFreq = melody[step];
    if (melodyFreq) {
      triggerMarimbaNote(ctx, melodyFreq, now, 0.2, 0.17);
    }

    if (onBeatStep) {
      onBeatStep(songStepIndex);
    }
    songStepIndex += 1;
  };

  tick();
  songTimerId = setInterval(tick, stepMs);
}

