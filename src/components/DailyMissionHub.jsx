import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Printer,
  CheckCircle2,
  Tv,
  ExternalLink,
  Sparkles,
  Star,
  Play,
  Compass,
  Award,
} from 'lucide-react';
import {
  CAPTAIN_SOUNDBOARD,
  DAILY_EXPEDITION_DAYS,
  DISCOVERY_STAGES,
} from '../data/dailyMissionsData';
import { speakEnglish } from '../utils/speech';
import {
  playTap,
  playSuccess,
  playSparkle,
  playFanfare,
  playLegoSnap,
  playRadioBeep,
} from '../utils/soundEffects';

export default function DailyMissionHub({
  dailyChecklist = {},
  onToggleChecklistItem,
  discoveryResults = {},
  onOpenDiscoveryGame,
  onOpenPrintable,
  selectedDayId,
  onSelectDayId,
  isMuted = false,
  childName = 'Deniz',
  childAge = 7,
}) {
  const [internalDayId, setInternalDayId] = useState('day-0');
  const currentDayId = selectedDayId || internalDayId;

  const setDayId = (dayId) => {
    playTap(isMuted);
    if (onSelectDayId) {
      onSelectDayId(dayId);
    } else {
      setInternalDayId(dayId);
    }
  };

  const activeDay =
    DAILY_EXPEDITION_DAYS.find((d) => d.id === currentDayId) || DAILY_EXPEDITION_DAYS[0];

  // Discovery summary metrics
  const totalDiscoveryQuestions = DISCOVERY_STAGES.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredDiscoveryCount = Object.keys(discoveryResults).length;
  const discoveryStarsEarned = DISCOVERY_STAGES.filter((stage) =>
    stage.questions.every((q) => Boolean(discoveryResults[q.id]))
  ).length;

  // Selected day checklist progress
  const dayItems = activeDay.items || [];
  const completedDayItemsCount = dayItems.filter((item) => Boolean(dailyChecklist[item.id])).length;
  const dayProgressPercent =
    dayItems.length > 0 ? Math.round((completedDayItemsCount / dayItems.length) * 100) : 0;

  // Overall expedition checklist progress
  const totalExpeditionItems = DAILY_EXPEDITION_DAYS.reduce(
    (acc, d) => acc + (d.items?.length || 0),
    0
  );
  const completedExpeditionItems = DAILY_EXPEDITION_DAYS.reduce(
    (acc, d) => acc + (d.items || []).filter((i) => Boolean(dailyChecklist[i.id])).length,
    0
  );

  const launchCelebrationConfetti = () => {
    if (!isMuted) playSparkle(false);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore in non-browser environments
    }
  };

  const handleSoundboardClick = (btn) => {
    if (!isMuted) {
      if (btn.sfxType === 'radio') playRadioBeep(false);
      else if (btn.sfxType === 'sparkle') playSparkle(false);
      else if (btn.sfxType === 'success') playSuccess(false);
      else if (btn.sfxType === 'snap') playLegoSnap(false);
      else playFanfare(false);

      setTimeout(() => {
        speakEnglish(btn.speechEn);
      }, 220);
    }
  };

  const handleToggleItem = (itemId) => {
    const willBeDone = !dailyChecklist[itemId];
    if (willBeDone) {
      playSuccess(isMuted);
    } else {
      playTap(isMuted);
    }
    onToggleChecklistItem(itemId);
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'game':
        return { label: '🏀 Ev Oyunu', bg: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'music':
        return { label: '🎹 Piyano & Ritim', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'science':
        return { label: '🔬 Bilim Deneyi', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'craft':
        return { label: '🧱 Lego & Kart', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      default:
        return { label: '🚀 Günlük Görev', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
  };

  return (
    <div className="w-full max-w-5xl px-3 sm:px-5 py-5 space-y-6">
      {/* 1. HERO CAPTAIN / TRAINER CARD (İstanbul Seyahat Style) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-indigo-500/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={launchCelebrationConfetti}
              title="Kaptan! Tıkla ve Konfeti Patlat!"
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white/80 shadow-xl flex items-center justify-center text-4xl flex-shrink-0 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <span>🚀</span>
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-red-600 border-2 border-white text-white font-display font-black text-xs flex items-center justify-center shadow">
                {childAge}
              </span>
            </button>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
                  ⚡ Günlük Sefer Kontrolü
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-blue-200 font-bold text-[11px]">
                  {completedExpeditionItems} / {totalExpeditionItems} Görev Tamam
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
                Kaptan &amp; Pokemon Trainer {childName} • {childAge} Yaş
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                Günde 15 dakika baba-oğul İngilizce macerası • Almanca &amp; Türkçe destekli, sıfır sıkıcılık!
              </p>

              {/* Interest Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['🧱 Lego', '🃏 Pokemon', '🏀 Basketbol', '🎹 Piyano', '🔬 Checker Deniz'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Quick Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={launchCelebrationConfetti}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>🎉 Konfeti!</span>
            </button>

            <button
              onClick={() => {
                playTap(isMuted);
                if (onOpenPrintable) onOpenPrintable(activeDay);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-display font-black text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Siyah-Beyaz Görev Kağıdı</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KAPTAN SES KOKPİTİ (5 Interactive Soundboard Buttons) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border-4 border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-slate-900 leading-tight">
                Kaptan Ses Kokpiti (Tıkla &amp; Dinle)
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Her görev başında veya basket/piyano başarısında anonsu patlat!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CAPTAIN_SOUNDBOARD.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleSoundboardClick(btn)}
              className={`bg-gradient-to-br ${btn.colorClass} text-white rounded-2xl p-3 border-b-4 shadow-md hover:brightness-105 active:translate-y-0.5 transition text-left flex flex-col justify-between gap-2 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{btn.emoji}</span>
                <Volume2 className="w-4 h-4 opacity-85" />
              </div>
              <div>
                <div className="font-display font-black text-xs sm:text-sm leading-tight">
                  {btn.titleTr}
                </div>
                <div className="text-[10px] opacity-90 font-semibold mt-0.5">{btn.subtitleTr}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. FEATURED BANNER: 5-STAGE LEVEL DISCOVERY GAME */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-300 rounded-3xl p-5 shadow-xl border-4 border-amber-500 text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-yellow-300 font-black text-[11px] uppercase">
              ⭐ İlk Adım: Seviye Keşif Oyunu
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-slate-900 font-black text-[11px]">
              Kazanılan Yıldız: {discoveryStarsEarned} / 5 ⭐ ({answeredDiscoveryCount}/{totalDiscoveryQuestions} soru)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight">
            Neleri Biliyor, Neleri Öğreneceğiz? 5 Bölümlü Test Oyunu!
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-800 max-w-2xl">
            İlk 3 bölümü bitirmek Şampiyonluk için yeterli; 4 ve 5. bölümler ise Checker Tobi &amp; Pokemon Boss soruları!
            Beraber cevaplayıp Deniz’in kişisel süper güç listesini çıkarın.
          </p>
        </div>

        <button
          onClick={() => {
            playTap(isMuted);
            if (onOpenDiscoveryGame) onOpenDiscoveryGame();
          }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-yellow-300 font-display font-black text-sm sm:text-base shadow-lg transition active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-yellow-300" />
          <span>5 Bölümlü Testi Başlat</span>
        </button>
      </div>

      {/* 4. DAY SELECTOR BAR (Gün 0 – Gün 7) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900">
              8 Günlük Yapılandırılmış İngilizce Seferi (Günde 15 Dk)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {DAILY_EXPEDITION_DAYS.map((day) => {
            const isSelected = day.id === activeDay.id;
            const total = day.items?.length || 0;
            const done = (day.items || []).filter((i) => Boolean(dailyChecklist[i.id])).length;
            const isComplete = total > 0 && done === total;

            return (
              <button
                key={day.id}
                onClick={() => setDayId(day.id)}
                className={`px-3.5 py-2.5 rounded-2xl border-2 font-display font-black text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-800 shadow-md scale-[1.02]'
                    : isComplete
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span>{day.shortLabel}</span>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                    {done}/{total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 5. SELECTED DAY DETAIL PANEL */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-slate-200 space-y-5">
          {/* Day Header & Progress Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-100 pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs">
                  {activeDay.shortLabel} • {activeDay.badge}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  🎯 Kalıp: {activeDay.grammarFocus}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900">
                {activeDay.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {activeDay.desc}
              </p>
            </div>

            <button
              onClick={() => {
                playTap(isMuted);
                if (onOpenPrintable) onOpenPrintable(activeDay);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs flex-shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-yellow-300" />
              <span>Bu Günü S/B Yazdır</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span>{activeDay.shortLabel} İlerlemesi</span>
              <span>
                {completedDayItemsCount} / {dayItems.length} Görev Tamamlandı ({dayProgressPercent}%)
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-600 transition-all duration-300"
                style={{ width: `${dayProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Clickable Vocabulary Chips */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Günün Kelimeleri (Tıkla &amp; Dinle 🔊)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(activeDay.vocabFocus || []).map((v) => (
                <button
                  key={v.en}
                  onClick={() => {
                    playTap(isMuted);
                    speakEnglish(v.en);
                  }}
                  className="bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-3 text-left transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{v.emoji}</span>
                    <Volume2 className="w-4 h-4 text-blue-600 opacity-75 group-hover:opacity-100" />
                  </div>
                  <div className="font-display font-black text-sm text-slate-900">{v.en}</div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    🇹🇷 {v.tr} • 🇩🇪 {v.de}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step-by-Step Checkable Timeline Cards */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Adım Adım Günlük Akış (Tamamladıkça İşaretle ✓)
            </p>
            {dayItems.map((item) => {
              const isChecked = Boolean(dailyChecklist[item.id]);
              const cat = getCategoryStyle(item.category);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-4 border-2 transition ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-700 text-white'
                          : 'bg-white border-slate-400 hover:border-blue-500'
                      }`}
                      aria-label={`${item.title} tamamlandı işaretle`}
                    >
                      {isChecked && <CheckCircle2 className="w-5 h-5" />}
                    </button>

                    <div className="flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-black text-[11px]">
                          {item.time}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-black ${cat.bg}`}>
                          {cat.label}
                        </span>
                      </div>

                      <h4
                        className={`font-display font-black text-base sm:text-lg ${
                          isChecked ? 'line-through text-emerald-900' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {item.desc}
                      </p>

                      {/* Clickable English Phrases */}
                      {item.phrasesEn && item.phrasesEn.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.phrasesEn.map((phrase) => (
                            <button
                              key={phrase}
                              type="button"
                              onClick={() => {
                                playTap(isMuted);
                                speakEnglish(phrase);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-800 border-2 border-blue-200 hover:border-blue-700 font-bold text-xs shadow-sm transition cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>“{phrase}”</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* B-Plan / Parent Tip */}
                      {item.bPlanTr && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-950 font-medium">
                          💡 <strong>B Planı &amp; Baba İpucu:</strong> {item.bPlanTr}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TV / Video Recommendation Card (Checker Tobi / Woozle Style) */}
          {activeDay.tvRecommendation && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border-2 border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center flex-shrink-0">
                  <Tv className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-yellow-300">
                      📺 Yeni TV İçin İngilizce Öneri (Checker Tobi / Woozle Tadında)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">
                      {activeDay.tvRecommendation.duration}
                    </span>
                  </div>
                  <h4 className="font-display font-black text-sm sm:text-base">
                    {activeDay.tvRecommendation.title} ({activeDay.tvRecommendation.channel})
                  </h4>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    {activeDay.tvRecommendation.topicTr}
                  </p>
                </div>
              </div>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  activeDay.tvRecommendation.searchQuery
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-black text-xs flex-shrink-0 shadow-md transition"
              >
                <span>YouTube’da Ara</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Day Complete Reward Footer */}
          {dayItems.length > 0 && completedDayItemsCount === dayItems.length && (
            <div className="bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-emerald-700" />
                <span className="font-display font-black text-sm sm:text-base text-emerald-950">
                  Harika {childName}! {activeDay.shortLabel} görevlerinin tamamı bitti! Şimdi buzdolabı çizelgendeki yıldızı boyayabilirsin! ⭐
                </span>
              </div>
              <Star className="w-6 h-6 text-amber-500 fill-amber-400 flex-shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
