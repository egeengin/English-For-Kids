import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  BookOpen,
  Star,
  CheckCircle2,
  Rocket,
  Flame,
  X,
  Play,
  RotateCcw,
  Calendar,
  Layers,
} from 'lucide-react';
import { speakEnglish, unlockAudio, stopSpeech } from '../utils/speech';
import { playLegoSnap, playSuccessChime, playTap } from '../utils/soundEffects';

export default function DailyRecallModal({
  isOpen,
  onClose,
  summary,
  childName = 'Deniz',
  isMuted = false,
  onNavigateTab,
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeakingWord, setActiveSpeakingWord] = useState(null);

  if (!isOpen || !summary) return null;

  const {
    recapStats,
    todayStats,
    spokenGreetingEn,
    summarySentenceTr,
    streak = 1,
  } = summary;

  const handlePlayVoiceSummary = () => {
    playTap(isMuted);
    unlockAudio();
    setIsPlayingAudio(true);
    speakEnglish(spokenGreetingEn, () => {
      setIsPlayingAudio(false);
    });
  };

  const handlePlayWord = (wordText) => {
    unlockAudio();
    setActiveSpeakingWord(wordText);
    speakEnglish(wordText, () => {
      setActiveSpeakingWord(null);
    });
  };

  const handleStartToday = (targetTab = null) => {
    stopSpeech();
    unlockAudio();
    playLegoSnap(isMuted);
    playSuccessChime(isMuted);
    onClose();
    if (targetTab && onNavigateTab) {
      onNavigateTab(targetTab);
    }
  };

  const timeHeading = recapStats?.isYesterday
    ? '📅 Dün Neler Yaptık?'
    : '🧠 Önceki Çalışmada Neler Yaptık?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 sm:border-6 border-slate-900 shadow-2xl p-5 sm:p-7 text-left overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Decorative Lego Studs Strip */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-yellow-400 flex justify-around items-center px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-yellow-300 border border-yellow-500 shadow-inner"
            />
          ))}
        </div>

        {/* Header with Close and Streak */}
        <div className="flex items-center justify-between gap-2 pt-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🌟</span>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 leading-tight">
                Tekrar Hoş Geldin, {childName}!
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
                Günlük İlerleme &amp; Hatırlatıcı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-100 border border-orange-300 text-orange-700 font-black text-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{streak} Günlük Seri</span>
            </div>
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3.5 pr-1 py-1">
          {/* Leo Speech Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="text-2xl flex-shrink-0">🦁</span>
              <div>
                <div className="text-xs font-black text-amber-900 uppercase tracking-wide">
                  Leo'nun Günlük Notu:
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                  {summarySentenceTr}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlayVoiceSummary}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-display font-black text-xs cursor-pointer shadow-sm transition ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
              title="Leo'dan İngilizce dinle"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? 'Dinletiliyor...' : 'Leo Seslendirsin'}</span>
            </button>
          </div>

          {/* Previous Activity Summary */}
          {recapStats ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{timeHeading}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <div className="text-base sm:text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>+{recapStats.stars}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">Yıldız Kazanıldı</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <div className="text-base sm:text-lg font-black text-blue-600 flex items-center justify-center gap-1">
                    <span>🧱</span>
                    <span>+{recapStats.bricks}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">Lego Parçası</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <div className="text-base sm:text-lg font-black text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{recapStats.questionsCount}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">Soru &amp; Görev</div>
                </div>
              </div>

              {/* Books Read */}
              {recapStats.booksRead && recapStats.booksRead.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 flex items-center gap-2.5">
                  <span className="text-xl">📖</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black text-purple-900 uppercase">
                      Okunan Mini Kitap:
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-purple-800 truncate">
                      {recapStats.booksRead.join(', ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartToday('books')}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-black text-xs cursor-pointer"
                  >
                    Tekrar Oku
                  </button>
                </div>
              )}

              {/* Words Practiced */}
              {recapStats.words && recapStats.words.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-black text-slate-700 uppercase flex items-center justify-between">
                    <span>🔤 Çalışılan Kelimeler (Dinlemek için dokun):</span>
                    <span className="text-slate-400 font-normal">
                      {recapStats.words.length} kelime
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recapStats.words.slice(0, 8).map((w, idx) => {
                      const wordText = typeof w === 'string' ? w : w.word;
                      const wordEmoji = typeof w === 'object' && w.emoji ? w.emoji : '⭐';
                      const wordTr = typeof w === 'object' && w.tr ? w.tr : '';
                      const isSpeaking = activeSpeakingWord === wordText;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePlayWord(wordText)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border transition cursor-pointer ${
                            isSpeaking
                              ? 'bg-yellow-400 border-yellow-600 text-slate-950 scale-105'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-yellow-400 hover:bg-yellow-50'
                          }`}
                          title={`Sesli dinle: ${wordText} ${wordTr ? `(${wordTr})` : ''}`}
                        >
                          <span>{wordEmoji}</span>
                          <span>{wordText}</span>
                          <Volume2 className="w-3 h-3 text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center space-y-1">
              <span className="text-3xl">🚀</span>
              <div className="font-display font-black text-sm text-sky-900">
                Bugün Yepyeni Bir Macera Başlıyor!
              </div>
              <p className="text-xs text-sky-700 font-bold">
                Mini kitapları oku, günlük şarkıyı dinle ve Lego parçaları kazanarak modellerini inşa et!
              </p>
            </div>
          )}

          {/* Today's Progress if active today */}
          {todayStats && (todayStats.stars > 0 || todayStats.questionsCount > 0) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <div className="text-[11px] font-black text-emerald-900 uppercase">
                    Bugünkü Başarın:
                  </div>
                  <div className="text-xs font-bold text-emerald-800">
                    +{todayStats.stars} Yıldız • {todayStats.questionsCount} Soru çözüldü
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                Aktif 🚀
              </span>
            </div>
          )}

          {/* Recommended Today Mission */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center space-y-2">
            <div className="text-xs font-black text-slate-800 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>Bugünün Hedefi:</span>
            </div>
            <p className="text-xs text-slate-600 font-bold">
              1 yeni mini kitap oku, günlük şarkıyı dinle ve 5 yıldız topla! 🌟
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleStartToday('daily')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs cursor-pointer transition shadow-xs"
              >
                📅 Günlük Çalışma
              </button>
              <button
                type="button"
                onClick={() => handleStartToday('books')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-display font-black text-xs cursor-pointer transition shadow-xs"
              >
                📖 Mini Kitaplar
              </button>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-200 mt-2">
          <button
            type="button"
            onClick={() => handleStartToday()}
            className="w-full py-3.5 px-6 rounded-2xl font-display font-black text-base sm:text-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-2 border-b-4 border-red-800 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <Play className="w-5 h-5 fill-yellow-300 text-yellow-300" />
            <span>MACERAYA DEVAM ET! 🧱</span>
          </button>
        </div>

      </div>
    </div>
  );
}
