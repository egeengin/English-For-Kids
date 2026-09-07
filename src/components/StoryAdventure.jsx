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
  MapPin,
  Clock,
  MessageCircle,
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
  time: { de: 'Zeit', tr: 'zaman / vakit' },
  for: { de: 'für', tr: 'için' },
  school: { de: 'Schule', tr: 'okul' },
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
  today: { de: 'heute', tr: 'bugün' },
  welcome: { de: 'willkommen', tr: 'hoş geldin' },
  to: { de: 'zu / in', tr: 'e / a' },
  bus: { de: 'Bus', tr: 'otobüs' },
  teacher: { de: 'Lehrer', tr: 'öğretmen' },
  friend: { de: 'Freund', tr: 'arkadaş' },
  class: { de: 'Klasse', tr: 'sınıf' },
  ready: { de: 'bereit', tr: 'hazır' },
  lets: { de: 'lass uns', tr: 'hadi' },
  go: { de: 'gehen', tr: 'gidelim' },
  play: { de: 'spielen', tr: 'oynayalım' },
  ball: { de: 'Ball', tr: 'top' },
  breakfast: { de: 'Frühstück', tr: 'kahvaltı' },
  eat: { de: 'essen', tr: 'yemek' },
  would: { de: 'möchtest', tr: 'ister misin' },
  like: { de: 'mögen', tr: 'sevmek' },
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

  // 2-Way Conversational Turn-Taking & Interactive Props State
  const [activeReply, setActiveReply] = useState(null);
  const [activeProp, setActiveProp] = useState(null);

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

  // Play dialogue line with synchronized karaoke word highlight matching actual speech pace
  const playKaraokeDialogue = (chapterObj) => {
    if (!chapterObj) return;
    if (karaokeTimerRef.current) clearInterval(karaokeTimerRef.current);
    setHighlightedWordIndex(null);
    setInspectedWord(null);

    const words = (chapterObj.characterLine || '').split(' ');
    speakDialoguePhrase(chapterObj.audioKey, chapterObj.characterLine, 'en');

    let currentWord = 0;
    setHighlightedWordIndex(0);
    // Approximate Samantha's 400ms per word pace for natural cadence
    const estimatedTotalMs = Math.max(2000, words.length * 400);
    const intervalMs = Math.floor(estimatedTotalMs / Math.max(1, words.length));

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
    setActiveReply(null);
    setActiveProp(null);

    if (!isMuted && chapter) {
      const timer = setTimeout(() => {
        playKaraokeDialogue(chapter);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentChapterIndex, isMuted]);

  // Handle clicking an interactive scene prop
  const handlePropClick = (prop) => {
    playSnap(isMuted);
    setActiveProp(prop);
    if (!isMuted) {
      speakDialoguePhrase(prop.audioKey, prop.name, 'en');
    }
  };

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

      // Trigger Mom / Character reply back
      if (choice.characterReply) {
        setActiveReply(choice.characterReply);
        if (!isMuted) {
          setTimeout(() => {
            speakDialoguePhrase(choice.characterReply.audioKey, choice.characterReply.text, 'en');
          }, 1100);
        }
      }

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

      const correctChoice = chapter.choices.find(c => c.isCorrect);
      if (correctChoice?.characterReply) {
        setActiveReply(correctChoice.characterReply);
        if (!isMuted) {
          setTimeout(() => {
            speakDialoguePhrase(correctChoice.characterReply.audioKey, correctChoice.characterReply.text, 'en');
          }, 1100);
        }
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

            const correctChoice = chapter.choices.find(c => c.isCorrect);
            if (correctChoice?.characterReply) {
              setActiveReply(correctChoice.characterReply);
              if (!isMuted) {
                setTimeout(() => {
                  speakDialoguePhrase(correctChoice.characterReply.audioKey, correctChoice.characterReply.text, 'en');
                }, 1200);
              }
            }

            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 },
            });
            if (onRewardEarned) {
              onRewardEarned({ stars: evalResult.stars || 3, bricks: 1 });
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
        
        {/* Illustrated Scene Backdrop & Interactive Props Canvas */}
        <div className={`w-full bg-gradient-to-r ${chapter.sceneBackdrop?.bgGradient || 'from-blue-500 via-indigo-500 to-purple-500'} p-4 sm:p-5 text-white relative overflow-hidden transition-all duration-300`}>
          {/* Subtle stud texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:16px_16px]" />

          {/* Scene Header Strip */}
          <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-black/35 backdrop-blur-md text-yellow-300 font-mono font-black text-xs px-3 py-1 rounded-full border border-yellow-400/30 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{chapter.sceneBackdrop?.timeTag || 'School Day'}</span>
              </span>
              <span className="bg-white/25 backdrop-blur-md text-white font-display font-black text-xs px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-yellow-200" />
                <span>{chapter.sceneBackdrop?.location || chapter.title}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-yellow-300">
              <span>{chapter.character.avatar}</span>
              <span className="hidden sm:inline">{chapter.character.role}:</span>
              <span>{chapter.character.name}</span>
              {chapter.character.actionBadge && (
                <span className="hidden sm:inline opacity-80 font-normal">• {chapter.character.actionBadge}</span>
              )}
            </div>
          </div>

          {/* Interactive Props Grid */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs font-bold text-white/90 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <span>🔍</span>
                <span>Tap objects in {childName}'s room to explore words:</span>
              </span>
              <span className="text-[11px] text-yellow-200 font-medium hidden sm:inline">
                Interactive Picture Book ✨
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(chapter.sceneBackdrop?.props || []).map((prop) => {
                const isSelected = activeProp?.id === prop.id;
                return (
                  <button
                    key={prop.id}
                    onClick={() => handlePropClick(prop)}
                    className={`
                      p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2.5 text-left cursor-pointer
                      ${isSelected
                        ? 'bg-white text-slate-900 border-yellow-400 shadow-lg scale-105 ring-2 ring-yellow-300'
                        : 'bg-black/25 hover:bg-black/40 text-white border-white/25 hover:border-white/50 backdrop-blur-sm active:scale-95'}
                    `}
                  >
                    <span className="text-2xl flex-shrink-0 animate-bounce">{prop.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-black text-xs truncate">
                        {prop.name}
                      </div>
                      <div className="text-[10px] opacity-80 truncate">
                        {prop.labelDe} • {prop.labelTr}
                      </div>
                    </div>
                    <Volume2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-amber-600' : 'text-white/70'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Prop Detail Popover */}
          {activeProp && (
            <div className="relative z-10 mt-3 bg-white text-slate-900 rounded-2xl p-3 sm:p-4 shadow-lg border-2 border-yellow-400 flex items-center justify-between gap-3 animate-scaleUp">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeProp.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm text-slate-950">
                      {activeProp.name}
                    </span>
                    <button
                      onClick={() => {
                        if (!isMuted) speakDialoguePhrase(activeProp.audioKey, activeProp.name, 'en');
                      }}
                      className="p-1 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-slate-900 transition-colors cursor-pointer"
                      title="Hear English pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-bold">
                    {activeProp.tagline}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mt-0.5">
                    <span>🇩🇪 {activeProp.labelDe}</span>
                    <span>•</span>
                    <span>🇹🇷 {activeProp.labelTr}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveProp(null)}
                className="text-slate-400 hover:text-slate-700 font-black p-1 text-sm cursor-pointer"
                aria-label="Close prop detail"
              >
                ✕
              </button>
            </div>
          )}
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
                  <div className="mt-2.5 p-2.5 bg-yellow-50 border-2 border-yellow-300 rounded-xl flex items-center justify-between text-xs animate-scaleUp">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                title="Listen in German"
              >
                <span>🇩🇪</span>
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{chapter.translationDe}</span>
              </button>

              <button
                onClick={() => speakTurkish(chapter.translationTr)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
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
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
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

          {/* Conversational 2-Way Turn-Taking Reply from Mom / Character */}
          {isChapterSolved && activeReply && (
            <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-3xl border-3 border-amber-400 shadow-md animate-scaleUp">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center text-2xl shadow-sm border-2 border-amber-500 flex-shrink-0">
                    {activeReply.avatar || chapter.character.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wide">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{activeReply.speaker || chapter.character.name} replies back:</span>
                    </div>
                    <p className="font-display font-black text-base sm:text-lg text-slate-900 leading-snug">
                      "{activeReply.text}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isMuted) speakDialoguePhrase(activeReply.audioKey, activeReply.text, 'en');
                  }}
                  className="w-10 h-10 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 flex items-center justify-center flex-shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
                  title="Hear reply again"
                  aria-label="Replay Mom reply"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Bilingual translation pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/70 text-xs font-bold text-slate-700">
                <button
                  onClick={() => speakGerman(activeReply.translationDe)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>🇩🇪</span>
                  <Volume2 className="w-3 h-3 text-slate-500" />
                  <span>{activeReply.translationDe}</span>
                </button>

                <button
                  onClick={() => speakTurkish(activeReply.translationTr)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>🇹🇷</span>
                  <Volume2 className="w-3 h-3 text-slate-500" />
                  <span>{activeReply.translationTr}</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Message Bar */}
          {feedbackMessage && (
            <div className={`mt-4 p-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-xs ${
              isChapterSolved ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{isChapterSolved ? '🎉' : '💡'}</span>
                <span>{feedbackMessage}</span>
              </div>
            </div>
          )}

          {/* Prominent Next Chapter Action Button */}
          {isChapterSolved && (
            <button
              onClick={handleNextChapter}
              className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-display font-black text-base sm:text-lg shadow-xl border-2 border-b-6 border-emerald-700 active:border-b-2 active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer select-none"
            >
              <span>
                {currentChapterIndex < totalChapters - 1
                  ? `Next: Chapter ${currentChapterIndex + 2} — ${story.chapters[currentChapterIndex + 1]?.title} ➔`
                  : 'Finish School Day Story! 🎓'}
              </span>
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </button>
          )}

          {/* Voice Echo Studio Widget: Child practices speaking response line */}
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
