import React from 'react';
import { Award, Printer, X, Sparkles, Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { playSparkle, playTap } from '../utils/soundEffects';

export default function CertificateModal({
  isOpen,
  onClose,
  childName = 'Deniz',
  childAge = 7,
  masteredWordsCount = 18,
  totalBricks = 12,
  totalStars = 36,
  isMuted = false,
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    if (!isMuted) playSparkle();
    window.print();
  };

  const handleClose = () => {
    if (!isMuted) playTap();
    onClose();
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      
      {/* Container - hide overlay elements when printing */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 border-b-2 border-amber-600 print:hidden">
          <div className="flex items-center gap-2 text-slate-900 font-display font-black text-lg">
            <Award className="w-6 h-6 text-amber-900" />
            <span>Refrigerator Diploma & Certificate 🖨️</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition active:scale-95"
            >
              <Printer className="w-4 h-4 text-yellow-300" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-800 hover:bg-amber-400 rounded-xl cursor-pointer transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DIPLOMA SHEET */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-amber-50 via-white to-yellow-50/50 print:p-6 print:m-0">
          
          {/* Ornate Gold & Lego Studded Border Frame */}
          <div className="relative border-4 border-amber-500 rounded-2xl p-6 sm:p-10 bg-white/90 shadow-inner print:border-4 print:border-amber-600">
            
            {/* Stud Decorative Corners */}
            <div className="absolute top-2 left-2 flex gap-1 text-amber-400">
              <span className="text-xl">🧱</span>
              <span className="text-xl">⭐</span>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 text-amber-400">
              <span className="text-xl">⭐</span>
              <span className="text-xl">🧱</span>
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1 text-amber-400">
              <span className="text-xl">🧱</span>
              <span className="text-xl">⭐</span>
            </div>
            <div className="absolute bottom-2 right-2 flex gap-1 text-amber-400">
              <span className="text-xl">⭐</span>
              <span className="text-xl">🧱</span>
            </div>

            {/* Certificate Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-amber-800 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Lego English Adventure Academy</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight">
                CERTIFICATE OF ACHIEVEMENT
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-500">
                Official Early Reader English Fluency & Master Builder Honor
              </p>
            </div>

            {/* Recipient Ribbon */}
            <div className="text-center my-6 py-4 border-y-2 border-dashed border-amber-300 bg-amber-50/60 rounded-xl">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">
                This prestigious award is proudly presented to:
              </p>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-amber-600 tracking-wide uppercase">
                {childName} (Age {childAge})
              </h2>
            </div>

            {/* Description Paragraph */}
            <p className="text-center text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
              For showing extraordinary curiosity, practicing spoken English with bravery and enthusiasm,
              and mastering vocabulary while building bilingual superpowers in English, German (🇩🇪), and Turkish (🇹🇷)!
            </p>

            {/* Badges / Stats Row */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-center">
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <span className="text-2xl">🧱</span>
                <p className="text-lg font-black text-red-600">{totalBricks}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Lego Bricks</p>
              </div>

              <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <span className="text-2xl">⭐</span>
                <p className="text-lg font-black text-amber-600">{totalStars}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Stars Earned</p>
              </div>

              <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <span className="text-2xl">🗣️</span>
                <p className="text-lg font-black text-emerald-600">{masteredWordsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Words Mastered</p>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="flex items-end justify-between pt-6 border-t-2 border-slate-200 text-slate-700">
              {/* Date */}
              <div className="text-center w-1/3">
                <p className="font-semibold text-xs text-slate-800 pb-1 border-b border-slate-300">
                  {formattedDate}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Date Awarded</p>
              </div>

              {/* Golden Seal */}
              <div className="w-1/3 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-4 border-amber-600 shadow-md flex items-center justify-center text-white">
                  <ShieldCheck className="w-8 h-8 text-amber-900" />
                </div>
                <p className="text-[10px] font-black text-amber-800 uppercase mt-1">Master Builder Seal</p>
              </div>

              {/* Signature */}
              <div className="text-center w-1/3">
                <p className="font-display font-black text-sm text-slate-800 pb-1 border-b border-slate-300 italic">
                  Leo the Builder 🧱 & Coach Samantha
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Academy Instructors</p>
              </div>
            </div>

          </div>

          {/* Fridge reminder note for parents */}
          <div className="mt-4 text-center print:hidden">
            <p className="text-xs text-slate-400 font-semibold">
              💡 Tip: Click <strong>Print / Save PDF</strong> and choose landscape or portrait to hang {childName}'s diploma on the refrigerator!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
