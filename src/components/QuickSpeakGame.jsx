import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Mic, CheckCircle2, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playStarSparkle, playTap, playGentleWobble } from '../utils/soundEffects';
import { createSpeechListener, evaluateKidPronunciation, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { startAudioClipRecorder } from '../utils/audioRecorder';
import { recordMasteredWord, recordMissedWord } from '../utils/reviewTracker';

const GLUE_WORDS = new Set(['a', 'an', 'the', 'is', 'are', 'i', 'my', 'and', 'in', 'on', 'to', 'us', 'at', 'please']);

function maskPhraseForMemory(phrase = '') {
  return phrase
    .split(' ')
    .map((token) => {
      const match = token.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}'’]+)([^\p{L}\p{N}]*)$/u);
      if (!match) return token;
      const [, prefix, core, suffix] = match;
      if (GLUE_WORDS.has(core.toLowerCase())) return token;
      return `${prefix}______${suffix}`;
    })
    .join(' ');
}

const SPEAK_PHRASES = [
  { emoji: '🍔', phrase: 'A burger and fries, please!', tr: 'Bir burger ve patates lütfen!' },
  { emoji: '🏀', phrase: 'Pass the ball, please!', tr: 'Topu pasla lütfen!' },
  { emoji: '🏊', phrase: 'Where is the pool?', tr: 'Havuz nerede?' },
  { emoji: '😄', phrase: 'I feel happy today!', tr: 'Bugün mutlu hissediyorum!' },
  { emoji: '🎹', phrase: 'Listen to my song!', tr: 'Şarkımı dinle!' },
  { emoji: '🌙', phrase: 'Good night, sweet dreams!', tr: 'İyi geceler, tatlı rüyalar!' },
  { emoji: '✈️', phrase: 'Let us fly to Antalya!', tr: 'Hadi Antalyaya uçalım!' },
  { emoji: '🌊', phrase: 'Let us go on the water slide!', tr: 'Su kaydırağına gidelim!' },
  { emoji: '💻', phrase: 'What is on the monitor?', tr: 'Monitörde ne var?' },
  { emoji: '👩‍⚕️', phrase: 'You help people feel better!', tr: 'İnsanların iyileşmesine yardım ediyorsun!' },
  { emoji: '⚽', phrase: 'The ball is under the table.', tr: 'Top masanın altında.' },
  { emoji: '🐶', phrase: 'The puppy is behind the tree.', tr: 'Yavru köpek ağacın arkasında.' },
  { emoji: '🎂', phrase: 'Happy birthday at Ballorig!', tr: 'Ballorigde doğum günün kutlu olsun!' },
  { emoji: '🍦', phrase: 'I want ice cream, please!', tr: 'Dondurma istiyorum lütfen!' },
  { emoji: '☔', phrase: 'I have a red umbrella.', tr: 'Kırmızı bir şemsiyem var.' },
  { emoji: '🦒', phrase: 'The giraffe is very tall!', tr: 'Zürafa çok uzun!' },
];

export default function QuickSpeakGame({ onRewardEarned, isMuted = false }) {
  const [idx, setIdx] = useState(0);
  const [speakMode, setSpeakMode] = useState('echo'); // 'echo' | 'memory'
  const [showHint, setShowHint] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [heardText, setHeardText] = useState('');
  const [passed, setPassed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const listenerRef = useRef(null);
  const recorderRef = useRef(null);
  const micSupported = isSpeechRecognitionSupported();

  const item = SPEAK_PHRASES[idx % SPEAK_PHRASES.length];
  const rewardStars = speakMode === 'memory' ? 5 : 3;
  const displayedPhrase =
    speakMode === 'memory' && !showHint && !passed
      ? maskPhraseForMemory(item.phrase)
      : item.phrase;

  useEffect(() => {
    return () => {
      if (listenerRef.current) listenerRef.current.abort();
    };
  }, []);

  const handleSuccess = () => {
    playStarSparkle(isMuted);
    setPassed(true);
    recordMasteredWord(item.phrase, item.emoji, item.tr);
    confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 } });
    if (onRewardEarned) onRewardEarned(rewardStars);
    if (!isMuted) speakEnglish('Awesome speaking!');
  };

  const stopClip = async () => {
    if (recorderRef.current) {
      const url = await recorderRef.current.stopAndGetUrl();
      recorderRef.current = null;
      if (url) setRecordedAudioUrl(url);
    }
  };

  const startMic = async () => {
    if (!micSupported || isListening) return;
    playTap(isMuted);
    setHeardText('');
    setFeedback('');
    setRecordedAudioUrl(null);
    setIsListening(true);

    recorderRef.current = await startAudioClipRecorder();

    listenerRef.current = createSpeechListener({
      lang: 'en-US',
      onInterim: (t) => setHeardText(t),
      onResult: async ({ transcript, isFinal } = {}) => {
        if (!isFinal) return;
        const finalText = transcript || '';
        setIsListening(false);
        await stopClip();
        setHeardText(finalText);
        const res = await evaluateKidPronunciation({
          targetPhrase: item.phrase,
          transcript: finalText,
        });
        if (res?.isAccepted) {
          setFeedback(res.feedbackEn || 'Awesome speaking!');
          handleSuccess();
        } else {
          playGentleWobble(isMuted);
          recordMissedWord(item.phrase, item.emoji, item.tr);
          setFeedback(res?.feedbackEn || 'Try saying it a bit clearer!');
        }
      },
      onError: () => {
        setIsListening(false);
        stopClip();
        setFeedback('Microphone unavailable — you can tap "I said it! ✓".');
      },
      onEnd: () => {
        setIsListening(false);
        stopClip();
      },
    });

    if (listenerRef.current) listenerRef.current.start();
  };

  const nextPhrase = () => {
    playTap(isMuted);
    if (listenerRef.current) listenerRef.current.abort();
    setIdx((i) => i + 1);
    setPassed(false);
    setShowHint(false);
    setHeardText('');
    setFeedback('');
    setRecordedAudioUrl(null);
    setIsListening(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-violet-200 p-5 sm:p-8 text-center">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <span>🎙️</span>
            <span>Say It Fast!</span>
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-violet-100 text-violet-900 font-black text-sm border border-violet-300">
            {idx % SPEAK_PHRASES.length + 1} / {SPEAK_PHRASES.length}
          </span>
        </div>

        {/* Simple 2-Mode Toggle */}
        <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-4 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              setSpeakMode('echo');
              setShowHint(false);
            }}
            className={`px-3.5 py-2 rounded-xl font-display font-black text-xs sm:text-sm transition cursor-pointer ${
              speakMode === 'echo'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            👀 Echo Mode (+3 ⭐)
          </button>
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              setSpeakMode('memory');
              setShowHint(false);
            }}
            className={`px-3.5 py-2 rounded-xl font-display font-black text-xs sm:text-sm transition cursor-pointer ${
              speakMode === 'memory'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            🧠 Memory Mode (+5 ⭐)
          </button>
        </div>

        <div className="text-6xl mb-3 mt-1 leading-none">{item.emoji}</div>
        <div className="font-display font-black text-2xl sm:text-4xl text-slate-900 mb-4">
          {displayedPhrase}
        </div>

        {speakMode === 'memory' && !passed && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setShowHint((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs border border-amber-300 cursor-pointer"
            >
              {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showHint ? 'Hide Words' : '💡 Show Hint'}</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              if (!isMuted) speakEnglish(item.phrase);
            }}
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-lg shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
            <span>Listen</span>
          </button>

          {micSupported && (
            <button
              type="button"
              onClick={startMic}
              disabled={isListening}
              className={`px-6 py-3.5 rounded-2xl font-display font-black text-lg shadow-md flex items-center gap-2 cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              <Mic className="w-6 h-6" />
              <span>{isListening ? 'Listening...' : 'Speak Now'}</span>
            </button>
          )}

          {!passed && (
            <button
              type="button"
              onClick={handleSuccess}
              className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-base shadow-md cursor-pointer"
            >
              I said it! ✓
            </button>
          )}

          {recordedAudioUrl && (
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                new Audio(recordedAudioUrl).play().catch(() => {});
              }}
              className="px-5 py-3.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-display font-black text-base border-2 border-purple-300 flex items-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>Hear My Voice</span>
            </button>
          )}
        </div>

        {heardText && (
          <div className="mt-4 text-sm font-bold text-slate-600">
            Heard: <span className="text-slate-900">&quot;{heardText}&quot;</span>
          </div>
        )}
        {feedback && (
          <div className="mt-2 text-sm font-black text-violet-700">{feedback}</div>
        )}

        {passed && (
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-4 py-2 rounded-xl font-black">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Awesome speaking! (+{rewardStars} ⭐)</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </span>
            <button
              type="button"
              onClick={nextPhrase}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Next Phrase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
