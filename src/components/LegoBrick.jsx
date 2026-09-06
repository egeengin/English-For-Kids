import React from 'react';

/**
 * Reusable 3D tactile Lego brick component with authentic studs,
 * bevels, and drop-shadow styling.
 */
export default function LegoBrick({
  color = 'red',
  studs = 2,
  size = 'md',
  className = '',
  children,
  onClick,
  active = false,
  disabled = false,
}) {
  // Lego color definitions
  const colorStyles = {
    red: {
      bg: 'bg-red-500',
      border: 'border-red-700',
      stud: 'bg-red-400 border-red-600',
      text: 'text-white',
      shadow: 'border-b-red-800',
    },
    blue: {
      bg: 'bg-blue-600',
      border: 'border-blue-800',
      stud: 'bg-blue-500 border-blue-700',
      text: 'text-white',
      shadow: 'border-b-blue-900',
    },
    yellow: {
      bg: 'bg-yellow-400',
      border: 'border-yellow-600',
      stud: 'bg-yellow-300 border-yellow-500',
      text: 'text-slate-900',
      shadow: 'border-b-yellow-700',
    },
    green: {
      bg: 'bg-emerald-600',
      border: 'border-emerald-800',
      stud: 'bg-emerald-500 border-emerald-700',
      text: 'text-white',
      shadow: 'border-b-emerald-900',
    },
    orange: {
      bg: 'bg-orange-500',
      border: 'border-orange-700',
      stud: 'bg-orange-400 border-orange-600',
      text: 'text-white',
      shadow: 'border-b-orange-800',
    },
    purple: {
      bg: 'bg-purple-600',
      border: 'border-purple-800',
      stud: 'bg-purple-500 border-purple-700',
      text: 'text-white',
      shadow: 'border-b-purple-900',
    },
    gray: {
      bg: 'bg-slate-400',
      border: 'border-slate-600',
      stud: 'bg-slate-300 border-slate-500',
      text: 'text-slate-900',
      shadow: 'border-b-slate-700',
    },
    gold: {
      bg: 'bg-amber-400',
      border: 'border-amber-600',
      stud: 'bg-amber-300 border-amber-500',
      text: 'text-slate-900',
      shadow: 'border-b-amber-700',
    },
  };

  const currentTheme = colorStyles[color] || colorStyles.red;

  // Size specifications
  const sizeStyles = {
    sm: {
      container: 'px-3 py-1.5 rounded-lg border-2 border-b-4 text-xs font-bold',
      stud: 'w-2.5 h-2.5 -top-1.5',
      studGap: 'gap-1.5',
    },
    md: {
      container: 'px-4 py-2.5 rounded-xl border-3 border-b-4 text-sm md:text-base font-bold',
      stud: 'w-3.5 h-3.5 -top-2',
      studGap: 'gap-2.5',
    },
    lg: {
      container: 'px-6 py-4 rounded-2xl border-4 border-b-6 text-lg md:text-xl font-bold',
      stud: 'w-5 h-5 -top-2.5',
      studGap: 'gap-3.5',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative inline-flex flex-col items-center justify-center
        ${currentTheme.bg} ${currentTheme.border} ${currentTheme.shadow} ${currentTheme.text}
        ${currentSize.container}
        ${onClick && !disabled ? 'cursor-pointer lego-btn-3d hover:brightness-105 select-none' : ''}
        ${active ? 'translate-y-1 brightness-110 shadow-sm' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Top Brick Studs */}
      <div className={`absolute left-0 right-0 flex justify-center ${currentSize.studGap} pointer-events-none`}>
        {Array.from({ length: studs }).map((_, i) => (
          <div
            key={i}
            className={`
              ${currentSize.stud} rounded-full border shadow-sm
              ${currentTheme.stud}
              relative flex items-center justify-center
            `}
          >
            {/* Stud Specular Highlight */}
            <div className="w-1/2 h-1/2 rounded-full bg-white/40 absolute top-0.5 left-0.5 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Brick Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
