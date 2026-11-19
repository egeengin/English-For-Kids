import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Lock, Volume2, Award, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playSnap, playVictoryFanfare, playGentleWobble, playTap } from '../utils/soundEffects';
import {
  createSpeechListener,
  evaluateKidPronunciation,
  isSpeechRecognitionSupported,
} from '../utils/speechRecognition';
import { recordMasteredWord } from '../utils/reviewTracker';

const STICKER_BADGES = [
  {
    id: 'pilot',
    cost: 10,
    emoji: '👨‍✈️',
    title: 'Antalya Pilot',
    powerLines: [
      'I can fly to Antalya!',
      'I am a pilot on a big plane!',
      'Look at the blue sea from the sky!',
    ],
  },
  {
    id: 'dolphin',
    cost: 25,
    emoji: '🐬',
    title: 'Happy Dolphin',
    powerLines: [
      'Dolphins swim fast in the sea!',
      'The happy dolphin can jump high!',
      'I see two dolphins in the blue water!',
    ],
  },
  {
    id: 'dino',
    cost: 45,
    emoji: '🦖',
    title: 'Museum T-Rex',
    powerLines: [
      'The giant dinosaur lives in the museum!',
      'T-Rex has got very big white teeth!',
      'Dinosaur bones are super old and huge!',
    ],
  },
  {
    id: 'piano',
    cost: 70,
    emoji: '🎹',
    title: 'Piano Star',
    powerLines: [
      'I play a happy song on the piano!',
      'Listen to my fast piano music!',
      'I practice piano every day at home!',
    ],
  },
  {
    id: 'rocket',
    cost: 100,
    emoji: '🚀',
    title: 'Space Explorer',
    powerLines: [
      'Three, two, one, blast off to space!',
      'My red Lego rocket flies to Mars!',
      'I can see the bright stars and moon!',
    ],
  },
  {
    id: 'parrot',
    cost: 140,
    emoji: '🦜',
    title: 'Pirate Parrot',
    powerLines: [
      'We found the gold treasure chest!',
      'The green pirate parrot can talk!',
      'Look behind the tree for the treasure!',
    ],
  },
  {
    id: 'ferry',
    cost: 190,
    emoji: '⛴️',
    title: 'Bosphorus Captain',
    powerLines: [
      'Seagulls fly next to our ferry in Istanbul!',
      'Our big white ferry crosses the sea!',
      'I like drinking tea on the ferry boat!',
    ],
  },
  {
    id: 'party',
    cost: 250,
    emoji: '🎂',
    title: 'Ballorig Champion',
    powerLines: [
      'Happy birthday party in Ballorig Kerkrade!',
      'Let us jump in the colorful ball pit!',
      'Can I have a slice of birthday cake, please?',
    ],
  },
];

export default function StickerCollection({
  bricks = 0,
  cardLevels = {},
  onEvolveCard,
  onRewardEarned,
  isMuted = false,
  childName = 'Deniz',
  childAge = 7,
  geminiApiKey = '',
}) {
  const [localLevels, setLocalLevels] = useState({});
  const [listeningBadgeId, setListeningBadgeId] = useState(null);
  const [statusByBadge, setStatusByBadge] = useState({});
  const listenerRef = useRef(null);
  const handledRef = useRef(false);
  const micSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (listenerRef.current) listenerRef.current.abort();
    };
  }, []);

  const getLevel = (badgeId) =>
    Math.min(3, Math.max(1, Number(cardLevels?.[badgeId] || localLevels[badgeId] || 1)));

  const unlockedCount = STICKER_BADGES.filter((b) => bricks >= b.cost).length;

  const completeEvolution = (badge, currentLv, targetLine) => {
    const nextLv = Math.min(3, currentLv + 1);
    setLocalLevels((prev) => ({ ...prev, [badge.id]: nextLv }));
    if (onEvolveCard) onEvolveCard(badge.id, nextLv);
    if (onRewardEarned) onRewardEarned({ stars: 3, bricks: 1 });
    recordMasteredWord(targetLine, badge.emoji);
    playVictoryFanfare(isMuted);
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setStatusByBadge((prev) => ({
      ...prev,
      [badge.id]: {
        type: 'success',
        text: nextLv === 3 ? '👑 MAX Efsanevi! (+3 ⭐)' : `🎉 Lv.${nextLv} Oldu! (+3 ⭐)`,
      },
    }));
    if (!isMuted) {
      speakEnglish(nextLv === 3 ? `Max level! Awesome ${badge.title}!` : `Level up! Great speaking!`);
    }
  };

  const handleStartEvolve = (badge) => {
    const currentLv = getLevel(badge.id);
    if (currentLv >= 3) return;
    const targetLine = badge.powerLines[currentLv - 1] || badge.powerLines[0];

    if (!micSupported) {
      setStatusByBadge((prev) => ({
        ...prev,
        [badge.id]: { type: 'fallback', text: 'Dinle ve "Söyledim ✓" butonuna bas!' },
      }));
      return;
    }

    if (listeningBadgeId === badge.id) {
      if (listenerRef.current) listenerRef.current.stop();
      setListeningBadgeId(null);
      return;
    }

    if (listenerRef.current) listenerRef.current.abort();
    playTap(isMuted);
    handledRef.current = false;
    setListeningBadgeId(badge.id);
    setStatusByBadge((prev) => ({
      ...prev,
      [badge.id]: { type: 'listening', text: '🎙️ Dinliyorum... Cümleyi söyle!' },
    }));

    listenerRef.current = createSpeechListener({
      lang: 'en-US',
      onResult: async ({ transcript, isFinal } = {}) => {
        if (!isFinal || !transcript || handledRef.current) return;
        handledRef.current = true;
        setListeningBadgeId(null);

        const evalRes = await evaluateKidPronunciation({
          targetPhrase: targetLine,
          transcript,
          childName,
          childAge,
          geminiApiKey,
        });

        if (evalRes?.isAccepted) {
          completeEvolution(badge, currentLv, targetLine);
        } else {
          playGentleWobble(isMuted);
          setStatusByBadge((prev) => ({
            ...prev,
            [badge.id]: {
              type: 'retry',
              text: `"${transcript}" duyuldu. Tekrar dene veya ✓ bas!`,
            },
          }));
        }
      },
      onError: () => {
        setListeningBadgeId(null);
        setStatusByBadge((prev) => ({
          ...prev,
          [badge.id]: {
            type: 'retry',
            text: 'Ses duyulmadı. Tekrar dene veya ✓ bas!',
          },
        }));
      },
      onEnd: () => {
        setListeningBadgeId(null);
      },
    });

    if (listenerRef.current) {
      listenerRef.current.start();
    } else {
      setListeningBadgeId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-200 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-500" />
              <span>{childName}&apos;s Hero Cards</span>
            </h2>
            <p className="text-sm font-bold text-slate-500">
              İngilizce cümleyi söyle, kartını Lv.3 Efsanevi yap! ({unlockedCount}/{STICKER_BADGES.length} Açık)
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 font-black text-sm border-2 border-amber-300">
            🧱 Puanın: {bricks}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STICKER_BADGES.map((badge) => {
            const isUnlocked = bricks >= badge.cost;
            const lv = getLevel(badge.id);
            const targetLine = badge.powerLines[lv - 1] || badge.powerLines[0];
            const isListeningThis = listeningBadgeId === badge.id;
            const status = statusByBadge[badge.id];

            if (!isUnlocked) {
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => {
                    playSnap(isMuted);
                    if (!isMuted) {
                      speakEnglish(`Earn ${badge.cost} bricks to unlock ${badge.title}!`);
                    }
                  }}
                  className="p-5 rounded-3xl border-4 border-slate-200 bg-slate-100 opacity-75 hover:opacity-95 flex flex-col items-center justify-center text-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <span className="text-5xl leading-none grayscale opacity-50">{badge.emoji}</span>
                  <div className="font-display font-black text-base text-slate-900 leading-tight">
                    {badge.title}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{badge.cost} 🧱</span>
                  </span>
                </button>
              );
            }

            const cardBorder =
              lv === 3
                ? 'bg-gradient-to-b from-amber-100 via-yellow-50 to-amber-50 border-amber-500 ring-2 ring-amber-300/60'
                : lv === 2
                ? 'bg-gradient-to-b from-purple-50 to-white border-purple-400'
                : 'bg-gradient-to-b from-sky-50 to-white border-sky-300';

            const lvBadgeStyle =
              lv === 3
                ? 'bg-amber-400 text-slate-950'
                : lv === 2
                ? 'bg-purple-600 text-white'
                : 'bg-sky-600 text-white';

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-3xl border-4 flex flex-col justify-between text-center gap-2.5 transition shadow-md ${cardBorder}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${lvBadgeStyle}`}>
                    {lv === 3 ? 'Lv.3 👑 MAX' : lv === 2 ? 'Lv.2 ⭐' : 'Lv.1'}
                  </span>
                  <Sparkles className={`w-4 h-4 ${lv === 3 ? 'text-amber-500' : 'text-slate-300'}`} />
                </div>

                <div>
                  <div className="text-5xl leading-none mb-1.5">{badge.emoji}</div>
                  <div className="font-display font-black text-base text-slate-900 leading-tight">
                    {badge.title}
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-slate-700 bg-white/85 border border-slate-200 rounded-xl px-2.5 py-1.5 leading-snug">
                    “{targetLine}”
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playSnap(isMuted);
                      if (!isMuted) speakEnglish(targetLine);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-800 font-display font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🔊 Cümleyi Dinle</span>
                  </button>

                  {lv < 3 ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEvolve(badge)}
                        className={`flex-1 py-2 px-2.5 rounded-xl font-display font-black text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm ${
                          isListeningThis
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isListeningThis ? 'Dinliyorum...' : '🎙️ Söyle & Evrimleştir!'}</span>
                      </button>
                      {(!micSupported || status?.type === 'retry' || status?.type === 'fallback') && (
                        <button
                          type="button"
                          onClick={() => completeEvolution(badge, lv, targetLine)}
                          className="py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-xs cursor-pointer"
                          title="Söyledim ✓"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-1.5 px-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs inline-flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>👑 MAX Efsanevi Kart!</span>
                    </div>
                  )}

                  {status?.text && (
                    <div
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                        status.type === 'success'
                          ? 'bg-emerald-100 text-emerald-900'
                          : status.type === 'listening'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {status.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
