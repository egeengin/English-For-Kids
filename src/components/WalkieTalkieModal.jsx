import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Mic, Volume2, X, Send, Bot, AlertCircle } from 'lucide-react';
import { chatWithLeoGemini, LEO_MISSIONS } from '../utils/gemini';
import { createSpeechListener, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { speakEnglish } from '../utils/speech';
import { playSnap, playTap, playSuccess, playRadioBeep } from '../utils/soundEffects';
import LeoBuddy from './LeoBuddy';

const LANGUAGE_OPTIONS = [
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr-TR', label: 'Türkçe', flag: '🇹🇷' },
];

export default function WalkieTalkieModal({
  isOpen,
  onClose,
  onRewardEarned,
  childName = 'Deniz',
  childAge = 7,
  geminiApiKey = '',
  isMuted = false,
}) {
  const [activeMissionId, setActiveMissionId] = useState('free');
  const [missionTurnCount, setMissionTurnCount] = useState(0);
  const [missionAwarded, setMissionAwarded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [micLanguage, setMicLanguage] = useState('en-US');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState('');

  const activeMission = LEO_MISSIONS.find((m) => m.id === activeMissionId) || LEO_MISSIONS[0];

  const [conversation, setConversation] = useState(() => [
    {
      sender: 'leo',
      en: LEO_MISSIONS[0].starterEn(childName),
      de: LEO_MISSIONS[0].starterDe(childName),
      tr: LEO_MISSIONS[0].starterTr(childName),
      hints: LEO_MISSIONS[0].starterHints,
    },
  ]);

  const speechListenerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const latestSpeechTextRef = useRef('');

  // Keep latestSpeechTextRef synchronized
  useEffect(() => {
    latestSpeechTextRef.current = speechText;
  }, [speechText]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isListening, speechText]);

  // Clean up speech listener on close/unmount
  useEffect(() => {
    return () => {
      if (speechListenerRef.current) {
        speechListenerRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleSelectMission = (mission) => {
    playTap(isMuted);
    if (speechListenerRef.current) {
      speechListenerRef.current.abort();
    }
    setIsListening(false);
    setSpeechText('');
    latestSpeechTextRef.current = '';
    setMicError('');
    setActiveMissionId(mission.id);
    setMissionTurnCount(0);
    setMissionAwarded(false);

    const starterEn = mission.starterEn(childName);
    setConversation([
      {
        sender: 'leo',
        en: starterEn,
        de: mission.starterDe(childName),
        tr: mission.starterTr(childName),
        hints: mission.starterHints,
      },
    ]);
    if (!isMuted) {
      speakEnglish(starterEn);
    }
  };

  // Send message to Leo (Gemini or local dialog)
  const handleSendMessage = async (textToSend) => {
    const message = (textToSend || latestSpeechTextRef.current || textInput || '').trim();
    if (!message) return;

    if (!isMuted) playSnap();

    const stepIndex = missionTurnCount;
    const nextTurns = missionTurnCount + 1;
    setMissionTurnCount(nextTurns);

    // Reset inputs & errors
    setConversation((prev) => [
      ...prev,
      { sender: 'child', en: message },
    ]);
    setSpeechText('');
    latestSpeechTextRef.current = '';
    setTextInput('');
    setMicError('');
    setIsLoading(true);

    try {
      const response = await chatWithLeoGemini({
        apiKey: geminiApiKey,
        message,
        childName,
        childAge,
        missionId: activeMissionId,
        stepIndex,
      });

      setConversation((prev) => [
        ...prev,
        {
          sender: 'leo',
          en: response.replyEn,
          de: response.replyDe,
          tr: response.replyTr,
          hints: response.hints || activeMission.starterHints,
          source: response.source,
        },
      ]);

      if (nextTurns >= activeMission.stepsCount && !missionAwarded) {
        setMissionAwarded(true);
        playSuccess(isMuted);
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.65 } });
        } catch {
          // ignore
        }
        if (onRewardEarned) {
          onRewardEarned({ stars: 5, bricks: 1 });
        }
      }

      if (!isMuted) {
        speakEnglish(response.replyEn);
      }
    } catch (err) {
      console.warn('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start speech recognition
  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setMicError('Speech recognition is not supported in this browser. You can tap the quick questions below or type!');
      return;
    }

    if (!isMuted) playRadioBeep();
    setMicError('');
    setSpeechText('');
    latestSpeechTextRef.current = '';
    setIsListening(true);

    if (speechListenerRef.current) {
      speechListenerRef.current.abort();
    }

    speechListenerRef.current = createSpeechListener({
      lang: micLanguage,
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (interim) => {
        setSpeechText(interim);
      },
      onFinal: (finalText) => {
        setIsListening(false);
        setSpeechText(finalText);
        latestSpeechTextRef.current = finalText;
        if (finalText && finalText.trim().length > 0) {
          handleSendMessage(finalText);
        }
      },
      onError: (err, errorType) => {
        console.warn('Speech recognition error:', err, errorType);
        setIsListening(false);
        if (errorType === 'not-allowed' || errorType === 'permission-denied') {
          setMicError('Microphone permission blocked. Please allow mic access or use buttons below!');
        } else if (errorType === 'no-speech') {
          // If the child was silent, just gently reset
          setMicError('No voice heard. Tap the button again and speak close to your microphone! 🎙️');
        } else {
          setMicError(err);
        }
      },
      onEnd: () => {
        setIsListening(false);
        // If there was speech captured that was not automatically finalized, send it
        if (latestSpeechTextRef.current && latestSpeechTextRef.current.trim().length > 0) {
          handleSendMessage(latestSpeechTextRef.current);
        }
      },
    });

    if (speechListenerRef.current) {
      speechListenerRef.current.start();
    }
  };

  // Stop speech recognition and send current text
  const handleStopListening = () => {
    if (speechListenerRef.current) {
      speechListenerRef.current.stop();
    }
    setIsListening(false);

    if (latestSpeechTextRef.current && latestSpeechTextRef.current.trim().length > 0) {
      handleSendMessage(latestSpeechTextRef.current);
    }
  };

  // Toggle listening on tap
  const handleToggleListening = () => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  const handleSpeakReply = (text, rate = 1.0) => {
    if (!isMuted && text) {
      speakEnglish(text, undefined, { rate });
    }
  };

  const latestLeoHints =
    [...conversation].reverse().find((m) => m.sender === 'leo' && Array.isArray(m.hints) && m.hints.length > 0)?.hints ||
    activeMission.starterHints;
  const clampedTurns = Math.min(missionTurnCount, activeMission.stepsCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      
      {/* Walkie-Talkie Device Frame */}
      <div className="relative w-full h-[100dvh] sm:h-[92dvh] sm:max-w-5xl bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-2xl border-0 sm:border-4 border-amber-600 flex flex-col justify-between">
        {/* Top Status & Controls Bar */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <LeoBuddy
              mood={isListening ? 'listening' : isLoading ? 'thinking' : 'happy'}
              size="sm"
              isMuted={isMuted}
            />
            <div className={`w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-400 shadow-sm'
            }`} />
            <span className="font-display font-black text-slate-900 text-sm sm:text-lg tracking-wide">
              LEO WALKIE-TALKIE 📻
            </span>
          </div>

          <button
            onClick={() => {
              if (speechListenerRef.current) speechListenerRef.current.abort();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer transition border border-amber-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single-Row Mission & Mic Language Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-amber-500/40 rounded-xl px-2.5 py-1.5 mb-2 border border-amber-600/30">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {LEO_MISSIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMission(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-display font-black whitespace-nowrap transition cursor-pointer ${
                  activeMissionId === m.id
                    ? 'bg-slate-900 text-yellow-300 shadow-xs'
                    : 'bg-amber-100/80 hover:bg-white text-slate-900'
                }`}
              >
                {m.emoji} {m.labelEn || m.labelTr}
              </button>
            ))}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-black whitespace-nowrap ${
                missionAwarded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/90 text-slate-900'
              }`}
            >
              {missionAwarded ? '3/3 🏆 +5 ⭐' : `${clampedTurns}/${activeMission.stepsCount} 🎯`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  playTap(isMuted);
                  setMicLanguage(lang.code);
                  if (isListening) handleStopListening();
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  micLanguage === lang.code
                    ? 'bg-slate-900 text-yellow-300 shadow-xs'
                    : 'bg-amber-200/60 hover:bg-white text-slate-800'
                }`}
                title={lang.label}
              >
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Walkie-Talkie LCD Screen / Chat Window */}
        <div className="w-full flex-1 min-h-0 bg-slate-950 rounded-2xl p-4 sm:p-6 border-4 border-slate-800 shadow-inner flex flex-col justify-between overflow-hidden relative">
          
          {/* LCD Scanline effect */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(0deg,#fff,#fff_1px,transparent_1px,transparent_3px)]" />

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'leo' ? 'items-start' : 'items-end'
                }`}
              >
                {/* Speaker Tag */}
                <span className="text-xs font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                  {msg.sender === 'leo' ? '🧱 Leo (Friend)' : `👦 ${childName}`}
                </span>

                {/* Message Bubble */}
                <div
                  className={`max-w-[90%] p-3 sm:p-4 rounded-2xl font-semibold leading-relaxed shadow ${
                    msg.sender === 'leo'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="font-bold text-sm sm:text-lg">{msg.en}</p>
                </div>

                {/* Audio replay buttons for Leo (Normal & Slow) */}
                {msg.sender === 'leo' && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSpeakReply(msg.en, 0.95)}
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 bg-slate-900/70 px-3 py-1 rounded-lg border border-amber-500/30 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpeakReply(msg.en, 0.78)}
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-300 hover:text-emerald-200 bg-slate-900/70 px-3 py-1 rounded-lg border border-emerald-500/30 cursor-pointer"
                    >
                      <span>🐢 Slow &amp; Clear</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Live Listening Transcribing state */}
            {isListening && (
              <div className="flex flex-col gap-1 bg-red-950/40 p-2 rounded-xl border border-red-500/40 animate-pulse text-xs">
                <div className="flex items-center gap-2 text-yellow-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>Listening to {childName}...</span>
                </div>
                <p className="text-yellow-200 font-mono italic text-xs pl-4">
                  {speechText ? `"${speechText}"` : 'Speak now...'}
                </p>
              </div>
            )}

            {/* Mic Error Banner if any */}
            {micError && (
              <div className="flex items-center gap-1.5 bg-amber-950/60 p-2 rounded-xl border border-amber-500/40 text-[11px] text-amber-200">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                <span>{micError}</span>
              </div>
            )}

            {/* Loading / Gemini Thinking */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Leo is answering...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>
        </div>

        {/* Compact Hint Chips */}
        <div className="w-full mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {latestLeoHints.map((hint, idx) => (
            <div
              key={`${hint}-${idx}`}
              className="flex items-center justify-between gap-1.5 bg-amber-100 rounded-xl px-2.5 py-1.5 border border-amber-400/60 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  if (!isMuted) speakEnglish(hint);
                }}
                className="flex-1 text-left flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900 hover:text-blue-800 cursor-pointer"
                title="Listen"
              >
                <span className="text-amber-600">💡</span>
                <span>{hint}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(hint)}
                disabled={isLoading || isListening}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-yellow-300 font-black text-xs cursor-pointer flex-shrink-0"
                title="Send"
                aria-label="Send hint"
              >
                ➔
              </button>
            </div>
          ))}
        </div>

        {/* TAP-TO-TALK ACTION BUTTON */}
        <div className="w-full mt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleToggleListening}
            className={`flex-1 py-3.5 sm:py-4 px-5 rounded-2xl font-display font-black text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none transition transform active:scale-95 border-2 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300 border-red-600'
                : 'bg-slate-900 hover:bg-slate-800 text-yellow-300 border-slate-950'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-5 h-5 animate-bounce text-yellow-300" />
                <span>LISTENING... TAP TO SEND 🚀</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-amber-400" />
                <span>TAP TO TALK 🎙️</span>
              </>
            )}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(textInput);
            }}
            className="flex-1 flex items-center gap-1.5 bg-amber-200/90 rounded-2xl p-1.5 border border-amber-500/50"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type to Leo..."
              disabled={isLoading || isListening}
              className="flex-1 bg-white px-3 py-2 text-sm rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isLoading || isListening}
              className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 rounded-xl cursor-pointer transition shadow-xs"
              aria-label="Send text"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

