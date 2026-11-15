import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { DAILY_EXPEDITION_DAYS, DISCOVERY_STAGES } from '../data/dailyMissionsData';
import { playSparkle, playTap } from '../utils/soundEffects';

export default function PrintableMissionSheetModal({
  isOpen,
  onClose,
  childName = 'Deniz',
  childAge = 7,
  discoveryResults = {},
  selectedDay,
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

  const activeDay = selectedDay || DAILY_EXPEDITION_DAYS[0];
  const allQuestions = DISCOVERY_STAGES.flatMap((s) => s.questions);
  const masteredItems = allQuestions.filter((q) => discoveryResults[q.id]?.status === 'mastered');
  const assistedItems = allQuestions.filter((q) => discoveryResults[q.id]?.status === 'assisted');
  const learningItems = allQuestions.filter((q) => discoveryResults[q.id]?.status === 'learning');

  const handlePrint = () => {
    if (!isMuted) playSparkle(false);
    window.print();
  };

  const handleClose = () => {
    playTap(isMuted);
    onClose();
  };

  const paperMissions = [
    ...(activeDay.items || []).slice(0, 2).map((item) => ({
      title: item.title,
      phrase: item.phrasesEn?.[0] || activeDay.grammarFocus,
    })),
    {
      title: 'Kendi Pokemon-Lego Kartını Çiz & İngilizce Satırları Tamamla',
      phrase: 'I can ... / I like ...',
    },
    {
      title: 'Bugünün Kelimelerinden 2 Tanesini Sesli Olarak Babana Söyle & Yıldızı Boya',
      phrase: (activeDay.vocabFocus || []).map((v) => v.en).slice(0, 3).join(' • '),
    },
  ];

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl my-auto bg-white text-black rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none"
      >
        {/* Screen-only Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2 font-display font-black text-base">
            <Printer className="w-5 h-5 text-yellow-300" />
            <span>Siyah-Beyaz Yazıcı Dostu Görev & Pokemon Kartı Kağıdı (A4)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-sm font-black cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-white cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 100% BLACK & WHITE A4 PRINTABLE CONTENT */}
        <div className="p-6 sm:p-8 bg-white text-black space-y-5 print:p-4">
          {/* Header Row */}
          <div className="border-b-2 border-black pb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest">
                LEGO &amp; POKEMON ENGLISH EXPEDITION • B&amp;W ACTIVITY SHEET
              </p>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">
                {activeDay.shortLabel}: {activeDay.title}
              </h1>
              <p className="text-xs font-semibold mt-0.5">
                Trainer: <strong>{childName}</strong> (Yaş: {childAge}) • Tarih: ____ / ____ / 2026
              </p>
            </div>
            <div className="border-2 border-black rounded-lg px-3 py-2 text-center flex-shrink-0">
              <div className="text-[10px] font-bold uppercase">Yıldızlarını Boya</div>
              <div className="text-xl tracking-widest font-black">☆ ☆ ☆ ☆ ☆</div>
            </div>
          </div>

          {/* SECTION 1: DIY POKEMON & LEGO MASTER CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2">
            <div className="border-4 border-black rounded-xl p-4 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                  <span className="font-black text-sm uppercase tracking-wide">
                    TRAINER {childName.toUpperCase()} • LEVEL {childAge}
                  </span>
                  <span className="border-2 border-black px-2 py-0.5 text-xs font-black rounded">
                    HP: ____ 0
                  </span>
                </div>

                {/* Blank Drawing Frame */}
                <div className="border-2 border-dashed border-black rounded-lg h-44 flex flex-col items-center justify-center text-center p-3 mb-3">
                  <span className="text-xs font-bold uppercase">
                    Buraya Kendi Efsanevi Lego-Pokemon Karakterini Çiz!
                  </span>
                  <span className="text-[11px] mt-1">
                    (Boyamak için siyah beyaz çizim alanı)
                  </span>
                </div>

                {/* Element Checkboxes */}
                <div className="border border-black rounded-lg p-2 mb-3">
                  <div className="text-[10px] font-black uppercase mb-1">
                    Element / Güç Tipini İşaretle (Circle or Check):
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
                    <span>[ ] Fire</span>
                    <span>[ ] Water</span>
                    <span>[ ] Lightning</span>
                    <span>[ ] Grass</span>
                    <span>[ ] Lego Tech</span>
                  </div>
                </div>
              </div>

              {/* English Fill-in Lines */}
              <div className="space-y-2 text-xs font-bold pt-1">
                <div className="border-b border-black pb-1">
                  My name is: ____________________________________
                </div>
                <div className="border-b border-black pb-1">
                  I can: _________________________________________
                </div>
                <div className="border-b border-black pb-1">
                  I like: _________________________________________
                </div>
                <div className="border-b border-black pb-1">
                  Weakness: _____________________________________
                </div>
              </div>
            </div>

            {/* SECTION 2: GÜNÜN EV İÇİ GÖREVLERİ & KELİMELERİ */}
            <div className="flex flex-col justify-between space-y-4">
              {/* Today's Vocabulary Table */}
              <div className="border-2 border-black rounded-xl p-3.5">
                <h2 className="text-sm font-black uppercase border-b border-black pb-1.5 mb-2">
                  Günün Süper Kelimeleri ({activeDay.shortLabel})
                </h2>
                <p className="text-[11px] font-bold mb-2">
                  Kalıp: <span className="underline">{activeDay.grammarFocus}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(activeDay.vocabFocus || []).map((v) => (
                    <div key={v.en} className="border border-black rounded p-1.5">
                      <div className="font-black">{v.en}</div>
                      <div className="text-[11px]">
                        TR: {v.tr} • DE: {v.de}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Paper & Home Missions */}
              <div className="border-2 border-black rounded-xl p-3.5 flex-1">
                <h2 className="text-sm font-black uppercase border-b border-black pb-1.5 mb-2.5">
                  Günün 4 Görevi (Tamamlayınca [✓] Koy!)
                </h2>
                <div className="space-y-2.5 text-xs">
                  {paperMissions.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-black rounded-sm flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-black leading-snug">{m.title}</div>
                        <div className="text-[11px] italic">“{m.phrase}”</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: 7-DAY FRIDGE STAR TRACKER & PARENT DIAGNOSTIC SUMMARY */}
          <div className="border-2 border-black rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-black pb-1.5">
              <h2 className="text-sm font-black uppercase">
                7 Günlük Buzdolabı Yıldız Çizelgesi (Her gün 15 dk = 1 Yıldızı Boya!)
              </h2>
              <span className="text-[11px] font-bold">Hedef: 7 / 7 ☆</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                <div key={dayNum} className="border border-black rounded-lg py-2 px-1">
                  <div className="text-[11px] font-black">Gün {dayNum}</div>
                  <div className="text-2xl leading-tight">☆</div>
                </div>
              ))}
            </div>

            <div className="border-t border-black pt-2.5 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong>Baba Seviye Keşif Özeti:</strong> Bildikleri: <strong>{masteredItems.length}</strong> | Gelişenler:{' '}
                <strong>{assistedItems.length}</strong> | Yeni Hedefler: <strong>{learningItems.length}</strong>
              </div>
              {learningItems.length > 0 && (
                <div>
                  <strong>Sıradaki Süper Güçler:</strong>{' '}
                  {learningItems
                    .slice(0, 3)
                    .map((i) => i.skillLabelTr)
                    .join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
