import React, { useState, useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import {
  DISCOVERY_STAGES,
  DAILY_EXPEDITION_DAYS,
  getWorksheetQuestions,
} from '../data/dailyMissionsData';
import { playSparkle, playTap } from '../utils/soundEffects';

function PrintableWorksheetContent({
  onClose,
  childName,
  childAge,
  initialMode,
  initialStageId,
  initialDayId,
  isMuted,
}) {
  const [mode, setMode] = useState(initialMode);
  const [stageId, setStageId] = useState(initialStageId);
  const [dayId, setDayId] = useState(initialDayId);

  const worksheet = getWorksheetQuestions({ mode, stageId, dayId });
  const questions = worksheet.questions || [];

  const answerKeyStr = questions
    .map((q, idx) => {
      const correctIdx = q.options.findIndex((o) => o.isCorrect);
      const letter = ['A', 'B', 'C'][correctIdx] || '?';
      return `${idx + 1}-${letter}`;
    })
    .join('  •  ');

  const handlePrint = () => {
    if (!isMuted) playSparkle(false);
    window.print();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-4xl my-auto bg-white text-black rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none"
    >
      {/* Screen-only Top Control & Selector Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 space-y-2.5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-display font-black text-sm sm:text-base">
            <Printer className="w-5 h-5 text-yellow-300" />
            <span>Siyah-Beyaz 10 Soruluk Test Kağıdı (A4)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                onClose();
              }}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-white cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode + Stage/Day Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex rounded-xl bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setMode('stage');
              }}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                mode === 'stage' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              Bölüm 1–5 Testi
            </button>
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setMode('day');
              }}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                mode === 'day' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              Gün 1–7 Testi
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {mode === 'stage'
              ? DISCOVERY_STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      setStageId(s.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer border ${
                      stageId === s.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    Bölüm {s.number}
                  </button>
                ))
              : DAILY_EXPEDITION_DAYS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      setDayId(d.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer border ${
                      dayId === d.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {d.shortLabel}
                  </button>
                ))}
          </div>
        </div>
      </div>

      {/* 100% BLACK & WHITE A4 PRINTABLE TEST SHEET */}
      <div className="p-5 sm:p-6 bg-white text-black space-y-3 print:p-3">
        {/* Crisp B&W Header */}
        <div className="border-b-2 border-black pb-2.5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest">
              {childName.toUpperCase()}’İN İNGİLİZCE TESTİ • 10 SORU
            </p>
            <h1 className="text-lg sm:text-xl font-black leading-tight mt-0.5">
              {worksheet.title}
            </h1>
            <p className="text-[11px] font-semibold mt-0.5">
              Öğrenci: <strong>{childName} ({childAge} Yaş)</strong> • Tarih: ____ / ____ / 2026 •{' '}
              <span>{worksheet.subtitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="border-2 border-black rounded-lg px-2.5 py-1.5 text-center">
              <div className="text-[9px] font-bold uppercase">Puan</div>
              <div className="text-sm font-black">___ / 10</div>
            </div>
            <div className="border-2 border-black rounded-lg px-2.5 py-1.5 text-center">
              <div className="text-[9px] font-bold uppercase">Yıldızlar</div>
              <div className="text-sm font-black tracking-wider">☆ ☆ ☆ ☆ ☆</div>
            </div>
          </div>
        </div>

        {/* Optional 4-Word Mini Dictionary for Daily Tests */}
        {mode === 'day' && worksheet.vocabFocus && worksheet.vocabFocus.length > 0 && (
          <div className="border border-black rounded-lg p-2">
            <div className="text-[10px] font-black uppercase mb-1">
              Günün Mini Sözlüğü (Yardım Kutusu):
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              {worksheet.vocabFocus.map((v) => (
                <div key={v.en} className="border border-black rounded px-1.5 py-1">
                  <div className="font-black">{v.en}</div>
                  <div>
                    TR: {v.tr} • DE: {v.de}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10 Multiple-Choice Questions in Clean 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2.5">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="border border-black rounded-lg p-2.5 flex flex-col justify-between gap-1.5 break-inside-avoid"
            >
              <div>
                <div className="text-xs font-black leading-snug">
                  <span className="mr-1">{qIdx + 1}.</span>
                  <span>{q.promptEn}</span>
                </div>
                <div className="text-[10px] italic mt-0.5">({q.promptTrHelper})</div>
              </div>

              <div className="space-y-1 text-[11px] font-semibold pt-0.5">
                {q.options.map((opt, optIdx) => {
                  const letter = ['A', 'B', 'C'][optIdx];
                  return (
                    <div key={opt.id} className="flex items-start gap-1.5 leading-snug">
                      <span className="font-mono text-xs leading-none mt-0.5">☐</span>
                      <span>
                        <strong>{letter})</strong> {opt.textEn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Margin: Upside-Down Answer Key & Challenge Note */}
        <div className="border-t-2 border-black pt-2 flex items-center justify-between gap-3 text-[10px]">
          <span className="font-bold">
            Bölüm 1–3 = Şampiyon ⭐  |  Bölüm 4–5 = Efsanevi Boss 🔥
          </span>
          <span className="font-mono font-bold rotate-180 select-text">
            Cevap Anahtarı: {answerKeyStr}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PrintableMissionSheetModal({
  isOpen,
  onClose,
  childName = 'Deniz',
  childAge = 7,
  printConfig = {},
  isMuted = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initialMode = printConfig?.mode || 'stage';
  const initialStageId = printConfig?.stageId || 'stage-1';
  const initialDayId = printConfig?.dayId || 'day-1';

  return (
    <div
      onClick={() => {
        playTap(isMuted);
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <PrintableWorksheetContent
        key={`${initialMode}-${initialStageId}-${initialDayId}`}
        onClose={onClose}
        childName={childName}
        childAge={childAge}
        initialMode={initialMode}
        initialStageId={initialStageId}
        initialDayId={initialDayId}
        isMuted={isMuted}
      />
    </div>
  );
}
