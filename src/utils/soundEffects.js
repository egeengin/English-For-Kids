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
