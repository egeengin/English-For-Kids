import React from 'react';
import { speakEnglish, unlockAudio } from '../utils/speech';
import { playTap } from '../utils/soundEffects';

const SIZE_CLASSES = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28 sm:w-32 sm:h-32',
};

/**
 * Expressive animated SVG lion cub companion (Leo) wearing an explorer cap and scarf.
 */
export default function LeoBuddy({
  mood = 'idle',
  size = 'md',
  speechBubble = '',
  onClick,
  isMuted = false,
  className = '',
}) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const isCheering = mood === 'cheering' || mood === 'excited';
  const isListening = mood === 'listening';
  const isThinking = mood === 'thinking';
  const isDancing = mood === 'dancing';
  const isWaving = mood === 'waving';

  const handleClick = () => {
    playTap(isMuted);
    unlockAudio();
    if (onClick) {
      onClick();
    } else if (speechBubble && !isMuted) {
      speakEnglish(speechBubble);
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={speechBubble ? `Leo says: ${speechBubble}` : 'Leo the Adventure Buddy'}
        className={`relative flex-shrink-0 rounded-full cursor-pointer focus-visible:outline-blue-600 transition-transform hover:scale-105 ${
          isDancing ? 'animate-bounce' : 'island-float'
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

          {/* Explorer Cap */}
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

          {/* Eyes */}
          {isCheering || mood === 'happy' ? (
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

      {speechBubble && (
        <button
          type="button"
          onClick={handleClick}
          className="relative bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-2.5 text-left shadow-sm cursor-pointer max-w-sm transition"
        >
          <span
            aria-hidden="true"
            className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-amber-300 rotate-45"
          />
          <p className="font-display font-bold text-sm sm:text-base text-slate-900 leading-snug">
            {speechBubble}
          </p>
        </button>
      )}
    </div>
  );
}
