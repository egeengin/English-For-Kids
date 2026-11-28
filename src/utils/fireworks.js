import confetti from 'canvas-confetti';
import { playVictoryFanfare, playSparkle } from './soundEffects.js';

/**
 * Fires animated multi-burst sky fireworks using canvas-confetti + fanfare audio.
 * Returns a cleanup function that cancels pending bursts on component unmount.
 */
export function launchFireworksShow({ grand = false, isMuted = false } = {}) {
  playVictoryFanfare(isMuted);

  const bursts = grand
    ? [
        { delay: 0, particleCount: 95, spread: 80, angle: 60, origin: { x: 0.18, y: 0.68 }, colors: ['#FACC15', '#38BDF8', '#EC4899', '#34D399'] },
        { delay: 220, particleCount: 95, spread: 80, angle: 120, origin: { x: 0.82, y: 0.68 }, colors: ['#A855F7', '#F59E0B', '#22D3EE', '#F43F5E'] },
        { delay: 560, particleCount: 110, spread: 100, startVelocity: 55, origin: { x: 0.5, y: 0.45 }, colors: ['#FDE047', '#FB7185', '#60A5FA', '#4ADE80'] },
        { delay: 1050, particleCount: 80, spread: 75, angle: 70, origin: { x: 0.25, y: 0.55 }, colors: ['#FBBF24', '#38BDF8', '#F472B6'] },
        { delay: 1450, particleCount: 80, spread: 75, angle: 110, origin: { x: 0.75, y: 0.55 }, colors: ['#34D399', '#A855F7', '#FACC15'] },
        { delay: 2050, particleCount: 100, spread: 110, startVelocity: 50, origin: { x: 0.5, y: 0.35 }, colors: ['#FDE047', '#EC4899', '#22D3EE', '#FFFFFF'] },
        { delay: 2650, particleCount: 120, spread: 120, startVelocity: 60, origin: { x: 0.5, y: 0.5 }, colors: ['#FACC15', '#F97316', '#38BDF8', '#10B981', '#EC4899'] },
      ]
    : [
        { delay: 0, particleCount: 70, spread: 70, origin: { x: 0.3, y: 0.62 }, colors: ['#FACC15', '#38BDF8', '#34D399'] },
        { delay: 260, particleCount: 70, spread: 70, origin: { x: 0.7, y: 0.62 }, colors: ['#A855F7', '#FB7185', '#FDE047'] },
        { delay: 620, particleCount: 90, spread: 95, origin: { x: 0.5, y: 0.45 }, colors: ['#FACC15', '#22D3EE', '#4ADE80', '#F43F5E'] },
      ];

  const timers = bursts.map((burst) =>
    setTimeout(() => {
      if (burst.delay > 0) {
        playSparkle(isMuted);
      }
      try {
        confetti({
          particleCount: burst.particleCount,
          spread: burst.spread,
          angle: burst.angle,
          startVelocity: burst.startVelocity,
          origin: burst.origin,
          colors: burst.colors,
          zIndex: 200,
        });
      } catch {
        // Ignore in non-DOM test environments
      }
    }, burst.delay)
  );

  return () => {
    for (const t of timers) clearTimeout(t);
  };
}
