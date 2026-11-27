import React from 'react';
import { Mic, Radio, Trophy, Compass } from 'lucide-react';
import LeoBuddy from './LeoBuddy';
import { playTap } from '../utils/soundEffects';

const VOICE_SPOTLIGHT = [
  {
    id: 'quick_speak',
    emoji: '🎙️',
    title: 'Say It Fast!',
    desc: 'Echo or speak from memory for bonus stars',
    badge: 'Voice Game',
    cardClass: 'from-violet-500 to-purple-600 text-white border-purple-800',
  },
  {
    id: 'walkie_talkie',
    emoji: '📻',
    title: 'Talk to Leo',
    desc: 'Chat live with Leo on your walkie-talkie',
    badge: 'Live Chat',
    cardClass: 'from-amber-400 to-orange-400 text-slate-950 border-amber-600',
  },
  {
    id: 'smart_review',
    emoji: '🔁',
    title: "Today's 8 Words",
    desc: 'Quick review of tricky words with Leo',
    badge: 'Spaced Review',
    cardClass: 'from-emerald-500 to-teal-600 text-white border-emerald-800',
  },
];

const ARCADE_GAMES = [
  { id: 'silly_sentences', emoji: '🤪', title: 'Silly Sentence Lab', desc: 'Mix crazy funny English sentences!', color: 'border-amber-300 hover:border-amber-500 bg-amber-50/80' },
  { id: 'balloons', emoji: '🎈', title: 'Balloon Pop', desc: 'Listen & pop the floating balloons', color: 'border-rose-300 hover:border-rose-500 bg-rose-50/70' },
  { id: 'phonics', emoji: '🔤', title: 'Phonics Snap', desc: 'Snap letter bricks into words', color: 'border-amber-300 hover:border-amber-500 bg-amber-50/70' },
  { id: 'memory', emoji: '🃏', title: 'Sound Memory', desc: 'Flip & match English sound pairs', color: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/70' },
  { id: 'rhymes', emoji: '🎵', title: 'Rhyming Pairs', desc: 'Match words that sound alike', color: 'border-purple-300 hover:border-purple-500 bg-purple-50/70' },
  { id: 'sound_pairs', emoji: '👂', title: 'Sound Detective', desc: 'Hear the clue & catch the picture', color: 'border-sky-300 hover:border-sky-500 bg-sky-50/70' },
  { id: 'listen_color', emoji: '🎨', title: 'Listen & Color', desc: 'Color each item by listening', color: 'border-pink-300 hover:border-pink-500 bg-pink-50/70' },
  { id: 'put_it', emoji: '📦', title: 'Put It There!', desc: 'In, on, under & behind puzzles', color: 'border-teal-300 hover:border-teal-500 bg-teal-50/70' },
  { id: 'differences', emoji: '🔍', title: 'Spot 7 Differences', desc: 'Find 7 secrets & learn new words', color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/70' },
  { id: 'questions', emoji: '❓', title: 'Question Quiz', desc: 'Fun picture Q&A rounds', color: 'border-cyan-300 hover:border-cyan-500 bg-cyan-50/70' },
];

export default function ArcadeHub({
  childName = 'Deniz',
  stars = 0,
  leoCostume = 'cap',
  onSelectGame,
  onOpenWalkieTalkie,
  isMuted = false,
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-6 flex-1 island-pop-in">
      {/* Arcade Banner */}
      <div className="rounded-3xl bg-white border-3 border-rose-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <LeoBuddy
          mood="excited"
          size="md"
          costume={leoCostume}
          speechBubble={`Welcome to Arcade Pier, ${childName}! Pick a game to win stars!`}
          isMuted={isMuted}
        />
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3.5 py-2 rounded-2xl bg-amber-100 border-2 border-amber-300 font-display font-black text-sm text-amber-900">
            ⭐ {stars} Total Stars
          </span>
        </div>
      </div>

      {/* Row 1: Voice & Speak Spotlight */}
      <section className="space-y-3">
        <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 flex items-center gap-2 px-1">
          <Mic className="w-5 h-5 text-purple-600" />
          <span>Voice &amp; Speak Spotlight</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VOICE_SPOTLIGHT.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playTap(isMuted);
                if (item.id === 'walkie_talkie') {
                  onOpenWalkieTalkie();
                } else {
                  onSelectGame(item.id);
                }
              }}
              className={`rounded-3xl bg-gradient-to-br ${item.cardClass} border-b-4 p-5 text-left shadow-md hover:-translate-y-0.5 transition cursor-pointer flex items-center gap-4`}
            >
              <span className="text-4xl sm:text-5xl flex-shrink-0">{item.emoji}</span>
              <div className="min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-black uppercase tracking-wide mb-1">
                  {item.badge}
                </span>
                <div className="font-display font-black text-lg leading-tight">{item.title}</div>
                <div className="text-xs font-bold opacity-90 mt-0.5">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Row 2: Arcade Mini-Games */}
      <section className="space-y-3">
        <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 flex items-center gap-2 px-1">
          <Radio className="w-5 h-5 text-rose-500" />
          <span>Arcade Mini-Games</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ARCADE_GAMES.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                playTap(isMuted);
                onSelectGame(game.id);
              }}
              className={`rounded-3xl border-3 ${game.color} p-4 text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer flex items-center gap-3.5`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-3xl flex-shrink-0 shadow-2xs">
                {game.emoji}
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-base sm:text-lg text-slate-900 leading-tight">
                  {game.title}
                </div>
                <div className="text-xs font-bold text-slate-600 mt-0.5">{game.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Row 3: Trophies & Level Check */}
      <section className="space-y-3 pb-2">
        <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 flex items-center gap-2 px-1">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Trophies &amp; Level Check</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              onSelectGame('collection');
            }}
            className="rounded-3xl bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 border-3 border-amber-300 p-5 text-left shadow-sm flex items-center gap-4 cursor-pointer transition"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl flex-shrink-0 shadow-xs">
              🏆
            </div>
            <div>
              <div className="font-display font-black text-lg text-slate-900">Hero Badge Cards</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">
                Evolve your badges by speaking English!
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              onSelectGame('discovery');
            }}
            className="rounded-3xl bg-gradient-to-r from-sky-100 to-indigo-100 hover:from-sky-200 hover:to-indigo-200 border-3 border-sky-300 p-5 text-left shadow-sm flex items-center gap-4 cursor-pointer transition"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <div className="font-display font-black text-lg text-slate-900">10-Stage Level Check</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">
                Test your English superpowers across 10 stages
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
