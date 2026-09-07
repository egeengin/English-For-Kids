import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Wrench,
  Layers,
  Smile,
  Check,
  ChevronRight,
  HelpCircle,
  Mic,
  MicOff,
  Bot,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { getStoryData } from '../data/storyData';
import { speakEnglish, speakGerman, speakTurkish, speakDialoguePhrase } from '../utils/speech';
import { playSnap, playVictoryFanfare, playStarSparkle, playTap, playGentleWobble } from '../utils/soundEffects';
import { createSpeechListener, evaluateKidPronunciation, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import VoiceRecorderWidget from './VoiceRecorderWidget';

// Lightweight dictionary for word-by-word inspector in karaoke read-along
const WORD_TRANSLATIONS = {
  good: { de: 'gut', tr: 'iyi' },
  morning: { de: 'Morgen', tr: 'günaydın' },
  hello: { de: 'Hallo', tr: 'merhaba' },
  name: { de: 'Name', tr: 'isim' },
  what: { de: 'was', tr: 'ne' },
  is: { de: 'ist', tr: 'nedir / dir' },
  your: { de: 'dein', tr: 'senin' },
  my: { de: 'mein', tr: 'benim' },
  fine: { de: 'gut / prima', tr: 'iyi' },
  thank: { de: 'danke', tr: 'teşekkür' },
  you: { de: 'du / dir', tr: 'sen / sana' },
  how: { de: 'wie', tr: 'nasıl' },
  are: { de: 'bist', tr: 'sın' },
  welcome: { de: 'willkommen', tr: 'hoş geldin' },
  to: { de: 'zu / in', tr: 'e / a' },
  school: { de: 'Schule', tr: 'okul' },
  bus: { de: 'Bus', tr: 'otobüs' },
  teacher: { de: 'Lehrer', tr: 'öğretmen' },
  friend: { de: 'Freund', tr: 'arkadaş' },
  class: { de: 'Klasse', tr: 'sınıf' },
  ready: { de: 'bereit', tr: 'hazır' },
  lets: { de: 'lass uns', tr: 'hadi' },
  go: { de: 'gehen', tr: 'gidelim' },
  deniz: { de: 'Deniz', tr: 'Deniz' },
};

export default function StoryAdventure({
  onRewardEarned,
  onNavigateToWorkshop,
  isMuted = false,
  childName = 'Deniz',
  childAge = 7,
  geminiApiKey = '',
}) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [interactionMode, setInteractionMode] = useState('choices'); // 'choices' | 'sentence' | 'voice'
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [builtSentenceWords, setBuiltSentenceWords] = useState([]);
  const [isChapterSolved, setIsChapterSolved] = useState(false);
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Voice Interaction State
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [voiceEvaluation, setVoiceEvaluation] = useState(null);
  const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const speechRecognitionRef = useRef(null);

  // Synchronized Karaoke Read-Along & Word Inspector State
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(null);
  const [inspectedWord, setInspectedWord] = useState(null);
  const karaokeTimerRef = useRef(null);

  const story = useMemo(() => getStoryData(childName), [childName]);
  const chapter = story.chapters[currentChapterIndex] || story.chapters[0];
  const totalChapters = story.chapters.length;

  const targetChoice = chapter.choices.find(c => c.isCorrect) || chapter.choices[0];
  const targetPhraseClean = (targetChoice?.text || '').replace(/[🧱⭐🎈🎉]/g, '').trim();

  // Play dialogue line with synchronized karaoke word highlight
  const playKaraokeDialogue = (chapterObj) => {
    if (!chapterObj) return;
    if (karaokeTimerRef.current) clearInterval(karaokeTimerRef.current);
    setHighlightedWordIndex(null);
    setInspectedWord(null);

    const words = (chapterObj.characterLine || '').split(' ');
    speakDialoguePhrase(chapterObj.audioKey, chapterObj.characterLine, 'en');

    let currentWord = 0;
    setHighlightedWordIndex(0);
    const intervalMs = Math.max(300, Math.min(500, Math.floor(2200 / Math.max(1, words.length))));

    karaokeTimerRef.current = setInterval(() => {
      currentWord++;
      if (currentWord < words.length) {
        setHighlightedWordIndex(currentWord);
      } else {
        clearInterval(karaokeTimerRef.current);
        karaokeTimerRef.current = null;
        setTimeout(() => setHighlightedWordIndex(null), 600);
      }
    }, intervalMs);
  };

  // Clean up speech recognition & karaoke timers on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
      if (karaokeTimerRef.current) {
        clearInterval(karaokeTimerRef.current);
      }
    };
  }, []);

  // Speak character line with karaoke when chapter loads
  useEffect(() => {
    setSelectedChoiceId(null);
    setBuiltSentenceWords([]);
    setIsChapterSolved(false);
    setFeedbackMessage('');
    setInspectedWord(null);

    if (!isMuted && chapter) {
      const timer = setTimeout(() => {
        playKaraokeDialogue(chapter);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentChapterIndex, isMuted]);

  // Handle clicking a choice in 2-choice mode
  const handleChoiceClick = (choice) => {
    playSnap(isMuted);
    setSelectedChoiceId(choice.id);

    if (!isMuted) {
      speakDialoguePhrase(choice.audioKey, choice.text, 'en');
    }

    if (choice.isCorrect) {
      setIsChapterSolved(true);
      setFeedbackMessage(choice.feedback);
      playStarSparkle(isMuted);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      if (onRewardEarned) {
        onRewardEarned({ stars: 1, bricks: 1 });
      }

      // Check if last chapter
      if (currentChapterIndex === totalChapters - 1) {
        setIsStoryComplete(true);
        playVictoryFanfare(isMuted);
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
        if (onRewardEarned) {
          onRewardEarned({ stars: 5, bricks: 3 });
        }
      }
    } else {
      setFeedbackMessage(choice.feedback);
    }
  };

  // Handle clicking a word in Sentence Builder mode
  const handleAddWordToSentence = (word) => {
    playSnap(isMuted);

    if (!isMuted) {
      speakEnglish(word.replace(/[^a-zA-Z]/g, ''));
    }

    const updated = [...builtSentenceWords, word];
    setBuiltSentenceWords(updated);

    const targetWords = chapter.sentenceBuilder.target;
    // Check if sentence matches target so far
    const isPrefixValid = updated.every((w, idx) => w === targetWords[idx]);

    if (!isPrefixValid) {
      setFeedbackMessage('Oops! That word does not fit here. Try again!');
      setTimeout(() => {
        setBuiltSentenceWords([]);
      }, 900);
      return;
    }

    // Check if complete
    if (updated.length === targetWords.length) {
      setIsChapterSolved(true);
      setFeedbackMessage('Fantastic sentence building! You snapped the bricks together!');
      playStarSparkle(isMuted);

      if (!isMuted) {
        setTimeout(() => {
          speakDialoguePhrase(chapter.choices.find(c => c.isCorrect)?.audioKey, updated.join(' '), 'en');
        }, 400);
      }

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });

      if (onRewardEarned) {
        onRewardEarned({ stars: 1, bricks: 1 });
      }

      if (currentChapterIndex === totalChapters - 1) {
        setIsStoryComplete(true);
        playVictoryFanfare(isMuted);
      }
    }
  };

  // Reset current sentence attempt
  const handleResetSentence = () => {
    playTap(isMuted);
    setBuiltSentenceWords([]);
    setFeedbackMessage('');
  };

  // Interactive Voice recognition and AI pronunciation evaluation
  const handleStartVoiceListening = () => {
    if (isListening) {
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    playTap(isMuted);
    setVoiceError(null);
    setVoiceEvaluation(null);
    setInterimSpeech('');

    if (!isSpeechRecognitionSupported()) {
      setVoiceError('Speech recognition is not supported in this browser. Please try Chrome or Safari.');
      return;
    }

    const listener = createSpeechListener({
      lang: 'en-US',
      onStart: () => {
        setIsListening(true);
      },
      onResult: async ({ transcript, isFinal }) => {
        setInterimSpeech(transcript);
        if (isFinal && transcript) {
          setIsListening(false);
          setIsEvaluatingSpeech(true);

          const evalResult = await evaluateKidPronunciation({
            targetPhrase: targetPhraseClean,
            transcript,
            childName,
            childAge,
            geminiApiKey,
          });

          setIsEvaluatingSpeech(false);
          setVoiceEvaluation(evalResult);

          if (evalResult.isAccepted) {
            setIsChapterSolved(true);
            setFeedbackMessage(evalResult.feedbackEn);
            playSnap(isMuted);
            playVictoryFanfare(isMuted);
            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 },
            });
            if (onRewardEarned) {
              onRewardEarned({ stars: evalResult.stars || 3, bricks: 1 });
            }

            if (!isMuted) {
              setTimeout(() => {
                speakEnglish(evalResult.feedbackEn);
              }, 400);
            }

            if (currentChapterIndex === totalChapters - 1) {
              setIsStoryComplete(true);
            }
          } else {
            setFeedbackMessage(evalResult.feedbackEn);
            playGentleWobble(isMuted);
          }
        }
      },
      onError: (msg) => {
        setIsListening(false);
        setVoiceError(msg);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (listener) {
      speechRecognitionRef.current = listener;
      listener.start();
    }
  };

  // Advance to next chapter
  const handleNextChapter = () => {
    playTap(isMuted);
    if (currentChapterIndex < totalChapters - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    } else {
      setIsStoryComplete(true);
    }
  };

  // Restart story from beginning
  const handleRestartStory = () => {
    playTap(isMuted);
    setCurrentChapterIndex(0);
    setIsStoryComplete(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col items-center">
      
      {/* Story Header & Mode Selector */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-white p-3 sm:p-4 rounded-2xl shadow-md border-4 border-blue-400">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md border-2 border-blue-700">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-800">
                {story.title}
              </h2>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-black px-2 py-0.5 rounded-full border border-blue-300 uppercase">
                Story Mode
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500">
              {story.subtitle}
            </p>
          </div>
        </div>

        {/* Interaction Style Toggle */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 border-2 border-slate-200 overflow-x-auto">
          <button
            onClick={() => {
              playTap(isMuted);
              setInteractionMode('choices');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black font-display transition-all whitespace-nowrap ${
              interactionMode === 'choices'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2 Big Choices
          </button>
          <button
            onClick={() => {
              playTap(isMuted);
              setInteractionMode('sentence');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black font-display transition-all whitespace-nowrap ${
              interactionMode === 'sentence'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧱 Sentence Bricks
          </button>
          <button
            onClick={() => {
              playTap(isMuted);
              setInteractionMode('voice');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black font-display transition-all whitespace-nowrap flex items-center gap-1 ${
              interactionMode === 'voice'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-700 hover:text-purple-950 bg-purple-50'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-amber-300" />
            <span>🎙️ Voice Talk {geminiApiKey ? '✨' : ''}</span>
          </button>
        </div>
      </div>

      {/* Chapters Progress Bar with Lego Studs */}
      <div className="w-full bg-slate-900 text-white px-3 sm:px-4 py-3 rounded-2xl shadow-lg border-2 border-slate-800 mb-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
          {story.chapters.map((chap, idx) => {
            const isCurrent = idx === currentChapterIndex;
            const isPast = idx < currentChapterIndex || (idx === currentChapterIndex && isChapterSolved);
            return (
              <button
                key={chap.id}
                onClick={() => {
                  playTap(isMuted);
                  setCurrentChapterIndex(idx);
                }}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex-shrink-0
                  ${isCurrent
                    ? 'bg-yellow-400 text-slate-950 shadow-md scale-105 border-2 border-yellow-500'
                    : isPast
                    ? 'bg-emerald-600/60 text-emerald-100 border border-emerald-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white'}
                `}
              >
                <span>{chap.chapterNumber}.</span>
                <span>{chap.title}</span>
                {isPast && <Check className="w-3 h-3 text-emerald-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Stage Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-slate-200 overflow-hidden mb-4">
        
        {/* Scene Backdrop Strip */}
        <div className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-4 sm:p-6 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner">
              {chapter.character.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl text-yellow-300">
                  {chapter.character.name}
                </span>
                <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  {chapter.character.role}
                </span>
              </div>
              <p className="text-xs font-bold text-white/90">
                Chapter {chapter.chapterNumber} of {totalChapters} • {chapter.title}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono font-bold text-yellow-300">
            <span>Reward: +1 🧱 Lego Brick</span>
          </div>
        </div>

        {/* Dialogue Bubble Section */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b-2 border-slate-200">
          
          {/* Character Speech Bubble */}
          <div className="relative bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-slate-200 mb-3">
            {/* Bubble Tail */}
            <div className="absolute -top-3 left-8 w-5 h-5 bg-white border-t-2 border-l-2 border-slate-200 rotate-45" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-display font-black text-xl sm:text-2xl text-slate-900 leading-snug flex flex-wrap items-center">
                  <span className="text-amber-500 mr-1">“</span>
                  {(chapter.characterLine || '').split(' ').map((word, idx) => {
                    const isCurrent = highlightedWordIndex === idx;
                    return (
                      <span
                        key={idx}
                        onClick={() => {
                          const clean = word.toLowerCase().replace(/[^a-z]/g, '');
                          if (!isMuted) speakEnglish(clean);
                          const trans = WORD_TRANSLATIONS[clean] || { de: clean, tr: clean };
                          setInspectedWord({ word: word.replace(/[^a-zA-Z]/g, ''), de: trans.de, tr: trans.tr });
                        }}
                        className={`inline-block mx-0.5 px-1.5 py-0.5 rounded-xl transition-all duration-150 cursor-pointer ${
                          isCurrent
                            ? 'bg-yellow-300 text-slate-950 scale-110 shadow-md font-black ring-2 ring-yellow-400'
                            : 'hover:bg-amber-100 hover:text-amber-900'
                        }`}
                        title="Click to hear word & see translation!"
                      >
                        {word}
                      </span>
                    );
                  })}
                  <span className="text-amber-500 ml-1">”</span>
                </div>

                {/* Word Inspector Card (if clicked) */}
                {inspectedWord && (
                  <div className="mt-2.5 p-2.5 bg-yellow-50 border-2 border-yellow-300 rounded-xl flex items-center justify-between text-xs animate-scale-up">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">"{inspectedWord.word}"</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 font-semibold">🇩🇪 {inspectedWord.de}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 font-semibold">🇹🇷 {inspectedWord.tr}</span>
                    </div>
                    <button
                      onClick={() => setInspectedWord(null)}
                      className="text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* English Replay Speaker with Karaoke sync */}
              <button
                onClick={() => playKaraokeDialogue(chapter)}
                className="w-12 h-12 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0 transition-transform active:scale-95 cursor-pointer"
                title="Hear English line with word highlight"
                aria-label="Replay English pronunciation"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            {/* German & Turkish Bilingual Subtitles & Audio */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => speakGerman(chapter.translationDe)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
                title="Listen in German"
              >
                <span>🇩🇪</span>
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{chapter.translationDe}</span>
              </button>

              <button
                onClick={() => speakTurkish(chapter.translationTr)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
                title="Listen in Turkish"
              >
                <span>🇹🇷</span>
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{chapter.translationTr}</span>
              </button>
            </div>

          </div>

          {/* Child Character Prompt + Voice Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs font-black text-slate-600">
              <span className="text-base">👦</span>
              <span>{chapter.questionPrompt}</span>
            </div>

            {/* Quick Microphone Button for instant voice conversation */}
            <button
              onClick={handleStartVoiceListening}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-black text-xs transition-all shadow-sm cursor-pointer select-none ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-300'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
              }`}
              title="Speak directly to character"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening ? 'Listening to ' + childName + '...' : 'Speak Now! 🎙️'}</span>
            </button>
          </div>

        </div>

        {/* Interaction Response Area */}
        <div className="p-4 sm:p-6 bg-white">
          
          {/* MODE 1: 2 Big Colorful Choices (50/50 Early-Reader Friendly) */}
          {interactionMode === 'choices' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {chapter.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                const showSuccess = isSelected && choice.isCorrect;
                const showError = isSelected && !choice.isCorrect;

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceClick(choice)}
                    className={`
                      relative p-5 rounded-2xl border-4 text-left transition-all duration-200 cursor-pointer
                      flex flex-col justify-between min-h-[110px]
                      ${showSuccess
                        ? 'bg-emerald-50 border-emerald-500 shadow-lg scale-[1.02]'
                        : showError
                        ? 'bg-amber-50 border-amber-400 shadow-md'
                        : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm'}
                    `}
                  >
                    {/* Top row: Choice Text & Speaker */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-display font-black text-lg sm:text-xl text-slate-900 leading-tight">
                        {choice.text}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Volume2 className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Bottom row: German & Turkish Helper Badges */}
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 flex-wrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                        🇩🇪 {choice.translationDe}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                        🇹🇷 {choice.translationTr}
                      </span>
                    </div>

                    {/* Selection Indicator */}
                    {showSuccess && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md animate-bounce">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* MODE 2: Tactile Lego Brick Sentence Builder */}
          {interactionMode === 'sentence' && (
            <div className="flex flex-col items-center gap-4">
              
              {/* Sentence Assembly Strip */}
              <div className="w-full min-h-[64px] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-2">{childName} says:</span>
                {builtSentenceWords.length === 0 && (
                  <span className="text-xs font-bold text-slate-400 italic">
                    Tap the Lego word bricks below in order!
                  </span>
                )}
                {builtSentenceWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-600 text-white font-display font-black text-sm px-3.5 py-1.5 rounded-xl shadow-md border-2 border-b-4 border-blue-800 flex items-center gap-1 animate-scaleUp"
                  >
                    <span>🧱</span>
                    <span>{word}</span>
                  </div>
                ))}
              </div>

              {/* Available Brick Options */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {chapter.sentenceBuilder.options.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddWordToSentence(word)}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-black text-base shadow-md border-2 border-b-4 border-amber-600 active:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🧱</span>
                    <span>{word}</span>
                  </button>
                ))}
              </div>

              {/* Reset sentence button */}
              {builtSentenceWords.length > 0 && !isChapterSolved && (
                <button
                  onClick={handleResetSentence}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start over</span>
                </button>
              )}

            </div>
          )}

          {/* MODE 3: Interactive Voice Conversation & Gemini AI Pronunciation */}
          {interactionMode === 'voice' && (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-purple-50/60 rounded-3xl border-3 border-dashed border-purple-300 space-y-4 text-center animate-fadeIn">
              
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                  Target Phrase for {childName}:
                </span>
                <span className="font-display font-black text-base sm:text-lg text-slate-900 bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-purple-200">
                  "{targetPhraseClean}"
                </span>
                <button
                  onClick={() => speakEnglish(targetPhraseClean)}
                  className="p-2 bg-white text-purple-700 hover:bg-purple-100 rounded-xl shadow-2xs border border-purple-200 cursor-pointer"
                  title="Listen to native pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Helper translations in German and Turkish */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  🇩🇪 {targetChoice?.translationDe}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  🇹🇷 {targetChoice?.translationTr}
                </span>
              </div>

              {/* Big Interactive Lego Microphone Brick Button */}
              <button
                onClick={handleStartVoiceListening}
                disabled={isEvaluatingSpeech}
                className={`
                  w-full max-w-md py-5 px-6 rounded-3xl font-display font-black text-lg sm:text-xl
                  transition-all duration-200 flex items-center justify-center gap-3 shadow-xl cursor-pointer select-none
                  border-4 border-b-8 active:border-b-2 active:translate-y-1.5
                  ${isListening
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-800 animate-pulse ring-4 ring-rose-300'
                    : isEvaluatingSpeech
                    ? 'bg-amber-400 text-slate-900 border-amber-600'
                    : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-900'}
                `}
              >
                {isListening ? (
                  <>
                    <Radio className="w-7 h-7 text-white animate-spin" />
                    <span>LISTENING TO {childName.toUpperCase()}... 🌊</span>
                  </>
                ) : isEvaluatingSpeech ? (
                  <>
                    <Sparkles className="w-7 h-7 text-slate-900 animate-spin" />
                    <span>EVALUATING WITH AI... ✨</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-7 h-7 text-yellow-300" />
                    <span>TAP & SPEAK TO {chapter.character.name.toUpperCase()}! 🎙️</span>
                  </>
                )}
              </button>

              {/* Live Transcript / Speech Indicator */}
              {interimSpeech && (
                <div className="bg-white border-2 border-purple-300 rounded-2xl p-3.5 text-xs font-bold text-slate-800 shadow-sm max-w-md w-full animate-scaleUp">
                  <div className="text-purple-700 font-black mb-1 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>What we heard from {childName}:</span>
                  </div>
                  <span className="text-base font-black font-display italic text-slate-900">
                    "{interimSpeech}"
                  </span>
                </div>
              )}

              {/* Evaluation Result Feedback Card */}
              {voiceEvaluation && (
                <div className={`p-4 rounded-2xl border-2 text-xs font-bold max-w-md w-full text-center space-y-1.5 animate-scaleUp shadow-md ${
                  voiceEvaluation.isAccepted
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-amber-50 border-amber-400 text-amber-950'
                }`}>
                  <div className="text-xl">
                    {voiceEvaluation.stars === 3 ? '⭐⭐⭐' : voiceEvaluation.stars === 2 ? '⭐⭐' : '⭐'}
                  </div>
                  <p className="text-sm font-black font-display">
                    {voiceEvaluation.feedbackEn}
                  </p>
                  <div className="text-[11px] text-slate-600 flex items-center justify-center gap-2 pt-1 border-t border-slate-200/60">
                    <span>🇩🇪 {voiceEvaluation.feedbackDe}</span>
                    <span>•</span>
                    <span>🇹🇷 {voiceEvaluation.feedbackTr}</span>
                  </div>
                  {voiceEvaluation.source === 'gemini' && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full mt-1 border border-purple-200">
                      <Bot className="w-3 h-3 text-purple-600" />
                      <span>Coached by Google Gemini AI ✨</span>
                    </div>
                  )}
                </div>
              )}

              {voiceError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 max-w-md">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-bold">
                {geminiApiKey ? '✨ Gemini AI Voice is active for intelligent Turkish & German accent recognition!' : '🧠 Built-in smart phonetic forgiving active for early learners.'}
              </p>
            </div>
          )}

          {/* Feedback Message Bar */}
          {feedbackMessage && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-black flex items-center justify-between ${
              isChapterSolved ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{isChapterSolved ? '🎉' : '💡'}</span>
                <span>{feedbackMessage}</span>
              </div>

              {isChapterSolved && (
                <button
                  onClick={handleNextChapter}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{currentChapterIndex < totalChapters - 1 ? 'Next Chapter' : 'Finish Story'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Voice Echo Studio Widget: Child practices speaking response line! */}
          {isChapterSolved && (
            <div className="mt-4 pt-3 border-t border-slate-200 animate-fadeIn">
              <VoiceRecorderWidget
                targetWord={chapter.choices.find(c => c.isCorrect)?.text || ''}
                targetAudioKey={chapter.choices.find(c => c.isCorrect)?.audioKey || ''}
                onRewardEarned={onRewardEarned}
                isMuted={isMuted}
                childName={childName}
              />
            </div>
          )}

        </div>

      </div>

      {/* Story Complete Celebration Screen */}
      {isStoryComplete && (
        <div className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-slate-950 rounded-3xl shadow-xl p-6 mb-4 border-4 border-yellow-500 animate-bounce">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white text-4xl flex items-center justify-center shadow-md">
                🎓
              </div>
              <div>
                <h3 className="font-display font-black text-2xl text-slate-950">
                  Congratulations! {childName} Finished School Today!
                </h3>
                <p className="text-xs font-bold text-slate-800">
                  You learned all daily greetings and conversations! +5 Stars ⭐ and +3 Lego Bricks 🧱!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRestartStory}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-display font-black text-xs shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                Play Story Again
              </button>
              <button
                onClick={onNavigateToWorkshop}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-display font-black text-xs shadow-md hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Build in Workshop</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
