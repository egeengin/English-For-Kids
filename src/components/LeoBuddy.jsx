import React, { useState, useRef, useEffect } from 'react';
import { speakEnglish, unlockAudio } from '../utils/speech';
import { playTap, playGiggle, playBoing } from '../utils/soundEffects';
import { LEO_TICKLE_LINES } from '../data/funnyData';

const SIZE_CLASSES = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28 sm:w-32 sm:h-32',
};

function renderLeoCostume(costume) {
  switch (costume) {
    case 'crown':
      return (
        <g transform="translate(0, -4)">
          <path
            d="M36 37 L38 17 L49 27 L60 12 L71 27 L82 17 L84 37 Z"
            fill="#FACC15"
            stroke="#B45309"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="22" r="3" fill="#EF4444" />
          <circle cx="44" cy="28" r="2.3" fill="#3B82F6" />
          <circle cx="76" cy="28" r="2.3" fill="#10B981" />
        </g>
      );
    case 'dino':
      return (
        <g transform="translate(0, -3)">
          <path d="M40 35 Q60 18 80 35 Z" fill="#10B981" stroke="#047857" strokeWidth="2.4" />
          <polygon points="48,25 53,13 58,23" fill="#34D399" stroke="#047857" strokeWidth="1.8" />
          <polygon points="57,22 62,10 67,22" fill="#34D399" stroke="#047857" strokeWidth="1.8" />
          <polygon points="66,25 71,14 75,26" fill="#34D399" stroke="#047857" strokeWidth="1.8" />
        </g>
      );
    case 'pirate':
      return (
        <g transform="translate(0, -4)">
          <path
            d="M28 38 Q42 14 60 22 Q78 14 92 38 Q60 43 28 38 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="2.4"
          />
          <circle cx="60" cy="30" r="4" fill="#FACC15" />
        </g>
      );
    case 'party':
      return (
        <g transform="translate(0, -4)">
          <polygon points="43,36 60,7 77,36" fill="#EC4899" stroke="#9D174D" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="55" cy="28" r="2.5" fill="#FACC15" />
          <circle cx="65" cy="24" r="2.5" fill="#38BDF8" />
          <circle cx="60" cy="7" r="4.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
        </g>
      );
    case 'astronaut':
      return (
        <g>
          <circle
            cx="60"
            cy="58"
            r="43"
            fill="rgba(186, 230, 253, 0.24)"
            stroke="#0284C7"
            strokeWidth="3"
          />
          <path d="M27 38 Q35 24 50 22" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case 'cap':
    default:
      return (
        <g transform="translate(0, -3)">
          <path
            d="M36 37 C38 22, 82 22, 84 37 Z"
            fill="#0284C7"
            stroke="#075985"
            strokeWidth="2.5"
          />
          <path
            d="M32 37 Q60 32 92 40 Q74 43 32 37 Z"
            fill="#38BDF8"
            stroke="#075985"
            strokeWidth="2.2"
          />
          <circle cx="60" cy="29" r="4.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
        </g>
      );
  }
}

/**
 * Expressive animated SVG lion cub companion (Leo) wearing swappable silly costumes & reacting to tickles.
 */
export default function LeoBuddy({
  mood = 'idle',
  size = 'md',
  costume = 'cap',
  speechBubble = '',
  onClick,
  isMuted = false,
  className = '',
}) {
  const [tickleLine, setTickleLine] = useState('');
  const [isJiggling, setIsJiggling] = useState(false);
  const jiggleTimerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const tickleIdxRef = useRef(0);

  useEffect(() => {
    return () => {
      if (jiggleTimerRef.current) clearTimeout(jiggleTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const activeMood = isJiggling ? 'cheering' : mood;
  const isCheering = activeMood === 'cheering' || activeMood === 'excited';
  const isListening = activeMood === 'listening';
  const isThinking = activeMood === 'thinking';
  const isDancing = activeMood === 'dancing';
  const isWaving = activeMood === 'waving';
  const activeBubble = tickleLine || speechBubble;

  const handleCharacterClick = () => {
    unlockAudio();
    if (onClick) {
      playTap(isMuted);
      onClick();
      return;
    }

    const lineIdx = tickleIdxRef.current % LEO_TICKLE_LINES.length;
    const line = LEO_TICKLE_LINES[lineIdx];
    tickleIdxRef.current += 1;

    if (lineIdx % 2 === 0) playGiggle(isMuted);
    else playBoing(isMuted);

    setIsJiggling(true);
    setTickleLine(line);
    if (jiggleTimerRef.current) clearTimeout(jiggleTimerRef.current);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    jiggleTimerRef.current = setTimeout(() => setIsJiggling(false), 720);
    bubbleTimerRef.current = setTimeout(() => setTickleLine(''), 3400);

    if (!isMuted) {
      speakEnglish(line);
    }
  };

  const handleBubbleClick = () => {
    playTap(isMuted);
    unlockAudio();
    if (onClick) {
      onClick();
    } else if (activeBubble && !isMuted) {
      speakEnglish(activeBubble);
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleCharacterClick}
        aria-label={activeBubble ? `Leo says: ${activeBubble}` : 'Tickle Leo the Adventure Buddy'}
        title="Tickle Leo!"
        className={`relative flex-shrink-0 rounded-full cursor-pointer focus-visible:outline-blue-600 transition-transform hover:scale-105 ${
          isJiggling ? 'animate-silly-jiggle' : isDancing ? 'animate-bounce' : 'island-float'
        }`}
      >
        {/* Listening pulse halo */}
        {isListening && (
          <>
            <span className="absolute -inset-2 rounded-full border-4 border-rose-400/60 animate-ping pointer-events-none" />
            <span className="absolute -inset-1 rounded-full border-2 border-rose-500/80 pointer-events-none" />
          </>
        )}

        {/* Cheering golden sparkle halo */}
        {isCheering && (
          <span className="absolute -inset-1.5 rounded-full bg-amber-300/35 blur-[2px] pointer-events-none" />
        )}

        <svg
          viewBox="0 0 120 120"
          className={`${sizeClass} drop-shadow-md overflow-visible`}
          role="img"
          aria-hidden="true"
        >
          {/* Fluffy Mane */}
          <g fill="#EA580C" stroke="#9A3412" strokeWidth="2.5">
            <circle cx="60" cy="62" r="40" />
            <circle cx="32" cy="40" r="13" />
            <circle cx="88" cy="40" r="13" />
            <circle cx="24" cy="62" r="12" />
            <circle cx="96" cy="62" r="12" />
            <circle cx="34" cy="84" r="12" />
            <circle cx="86" cy="84" r="12" />
            <circle cx="60" cy="92" r="13" />
          </g>

          {/* Ears */}
          <circle cx="34" cy="36" r="10" fill="#FBBF24" stroke="#9A3412" strokeWidth="2.5" />
          <circle cx="34" cy="36" r="5" fill="#FDE68A" />
          <circle cx="86" cy="36" r="10" fill="#FBBF24" stroke="#9A3412" strokeWidth="2.5" />
          <circle cx="86" cy="36" r="5" fill="#FDE68A" />

          {/* Face */}
          <circle cx="60" cy="62" r="30" fill="#FCD34D" stroke="#B45309" strokeWidth="2.5" />

          {/* Rosy Cheeks */}
          <ellipse cx="40" cy="68" rx="6" ry="3.5" fill="#FB7185" opacity="0.55" />
          <ellipse cx="80" cy="68" rx="6" ry="3.5" fill="#FB7185" opacity="0.55" />

          {/* Swappable Silly Hat / Costume */}
          {renderLeoCostume(costume)}

          {/* Eyes */}
          {isCheering || activeMood === 'happy' ? (
            <g fill="none" stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round">
              {isCheering ? (
                <>
                  <path d="M43 56 Q48 49 53 56" />
                  <path d="M67 56 Q72 49 77 56" />
                </>
              ) : (
                <>
                  <circle cx="48" cy="56" r="4.2" fill="#1E293B" stroke="none" />
                  <circle cx="72" cy="56" r="4.2" fill="#1E293B" stroke="none" />
                  <circle cx="49.5" cy="54.2" r="1.4" fill="#FFFFFF" stroke="none" />
                  <circle cx="73.5" cy="54.2" r="1.4" fill="#FFFFFF" stroke="none" />
                </>
              )}
            </g>
          ) : (
            <g>
              <circle cx="48" cy="56" r="4.5" fill="#1E293B" />
              <circle cx="72" cy="56" r="4.5" fill="#1E293B" />
              <circle cx="49.5" cy="54" r="1.6" fill="#FFFFFF" />
              <circle cx="73.5" cy="54" r="1.6" fill="#FFFFFF" />
              {isThinking && (
                <>
                  <path d="M42 47 Q48 44 54 47" stroke="#9A3412" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <path d="M66 49 L78 49" stroke="#9A3412" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                </>
              )}
            </g>
          )}

          {/* Muzzle & Nose */}
          <ellipse cx="60" cy="69" rx="13" ry="10" fill="#FEF3C7" />
          <path d="M55 63 Q60 60 65 63 Q62.5 68 60 68 Q57.5 68 55 63 Z" fill="#9A3412" />

          {/* Mouth by mood */}
          {isCheering ? (
            <path d="M51 71 Q60 82 69 71 Z" fill="#E11D48" stroke="#881337" strokeWidth="1.8" />
          ) : isListening ? (
            <ellipse cx="60" cy="74" rx="4.5" ry="5" fill="#E11D48" stroke="#881337" strokeWidth="1.8" />
          ) : isThinking ? (
            <path d="M54 74 Q60 72 67 74" fill="none" stroke="#9A3412" strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <path d="M52 71 Q60 79 68 71" fill="none" stroke="#9A3412" strokeWidth="2.6" strokeLinecap="round" />
          )}

          {/* Adventure Scarf */}
          <path
            d="M36 88 Q60 99 84 88 L80 98 Q60 107 40 98 Z"
            fill="#10B981"
            stroke="#065F46"
            strokeWidth="2.2"
          />
          <path
            d="M64 95 L74 109 L62 108 Z"
            fill="#34D399"
            stroke="#065F46"
            strokeWidth="2"
          />

          {/* Waving / Cheering Paws */}
          {(isWaving || isCheering) && (
            <g>
              <circle cx="18" cy="72" r="9" fill="#FCD34D" stroke="#B45309" strokeWidth="2.2" />
              <circle cx="15" cy="70" r="2" fill="#FDE68A" />
              {isCheering && (
                <circle cx="102" cy="72" r="9" fill="#FCD34D" stroke="#B45309" strokeWidth="2.2" />
              )}
            </g>
          )}

          {/* Mood Accent Icons */}
          {isCheering && (
            <g fill="#FACC15" stroke="#B45309" strokeWidth="1.2">
              <polygon points="16,24 19,30 25,31 20,35 21,41 16,38 11,41 12,35 7,31 13,30" />
              <polygon points="103,22 105,27 110,28 106,31 107,36 103,33 99,36 100,31 96,28 101,27" />
            </g>
          )}
          {isDancing && (
            <text x="95" y="34" fontSize="18" aria-hidden="true">🎵</text>
          )}
          {isThinking && (
            <text x="95" y="32" fontSize="16" aria-hidden="true">💭</text>
          )}
        </svg>
      </button>

      {activeBubble && (
        <button
          type="button"
          onClick={handleBubbleClick}
          className="relative bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-2.5 text-left shadow-sm cursor-pointer max-w-sm transition"
        >
          <span
            aria-hidden="true"
            className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-amber-300 rotate-45"
          />
          <p className="font-display font-bold text-sm sm:text-base text-slate-900 leading-snug">
            {activeBubble}
          </p>
        </button>
      )}
    </div>
  );
}
