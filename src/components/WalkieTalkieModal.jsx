import React, { useState, useEffect, useRef } from 'react';
import { Radio, Mic, MicOff, Volume2, X, Sparkles, Send, MessageSquare, Bot, AlertCircle } from 'lucide-react';
import { chatWithLeoGemini } from '../utils/gemini';
import { createSpeechListener, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { speakEnglish, speakGerman, speakTurkish } from '../utils/speech';
import { playSnap, playSparkle, playTap, playSuccess, playRadioBeep } from '../utils/soundEffects';

const QUICK_PROMPTS = [
  'Hi Leo! 👋',
  'What is your favorite color? 🎨',
  'I like fast race cars! 🏎️',
  'Can we build a rocket? 🚀',
  'I am hungry! 🍕',
  'Dogs or cats? 🐶',
];

const LANGUAGE_OPTIONS = [
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr-TR', label: 'Türkçe', flag: '🇹🇷' },
];

export default function WalkieTalkieModal({
  isOpen,
  onClose,
  childName = 'Deniz',
  childAge = 7,
  geminiApiKey = '',
  isMuted = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [micLanguage, setMicLanguage] = useState('en-US');
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'leo',
      en: `Krrch! Over to you, ${childName}! Tap the big button and talk to me!`,
      de: `Hallo ${childName}! Tippe auf den Knopf und sprich mit mir!`,
      tr: `Cızzt! Tamam ${childName}! Düğmeye bas ve benimle konuş!`,
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

  // Send message to Leo (Gemini or local dialog)
  const handleSendMessage = async (textToSend) => {
    const message = (textToSend || latestSpeechTextRef.current || textInput || '').trim();
    if (!message) return;

    if (!isMuted) playSnap();

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
      });

      setConversation((prev) => [
        ...prev,
        {
          sender: 'leo',
          en: response.replyEn,
          de: response.replyDe,
          tr: response.replyTr,
          source: response.source,
        },
      ]);

      if (!isMuted) {
        playRadioBeep();
        setTimeout(() => {
          speakEnglish(response.replyEn);
        }, 200);
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

  const handleSpeakReply = (text) => {
    if (!isMuted && text) {
      playRadioBeep();
      setTimeout(() => speakEnglish(text), 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Walkie-Talkie Device Frame */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-amber-600 flex flex-col items-center">
        
        {/* Rubber Walkie-Talkie Antenna on top */}
        <div className="absolute -top-7 left-12 w-4 h-8 bg-slate-800 rounded-t-lg border-2 border-slate-900 shadow-md">
          <div className="w-2 h-2 rounded-full bg-slate-600 mx-auto mt-1" />
        </div>

        {/* Top Status & Controls Bar */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* LED Status Light */}
            <div className={`w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-400 shadow-sm'
            }`} />
            <span className="font-display font-black text-slate-900 text-xs sm:text-sm tracking-wide">
              LEO'S 2-WAY WALKIE-TALKIE 📻
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

        {/* Language Selection Bar (Deniz speaks German & Turkish) */}
        <div className="w-full flex items-center justify-between bg-amber-500/40 rounded-xl px-2.5 py-1 mb-2.5 border border-amber-600/30">
          <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider">
            Mic Language:
          </span>
          <div className="flex items-center gap-1">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  playTap(isMuted);
                  setMicLanguage(lang.code);
                  if (isListening) handleStopListening();
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  micLanguage === lang.code
                    ? 'bg-slate-900 text-yellow-300 shadow-xs scale-105'
                    : 'bg-amber-200/60 hover:bg-white text-slate-800'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Walkie-Talkie LCD Screen / Chat Window */}
        <div className="w-full h-60 sm:h-64 bg-slate-950 rounded-2xl p-3 sm:p-4 border-4 border-slate-800 shadow-inner flex flex-col justify-between overflow-hidden relative">
          
          {/* LCD Scanline effect */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(0deg,#fff,#fff_1px,transparent_1px,transparent_3px)]" />

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'leo' ? 'items-start' : 'items-end'
                }`}
              >
                {/* Speaker Tag */}
                <span className="text-[10px] font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                  {msg.sender === 'leo' ? '🧱 Leo (Friend)' : `👦 ${childName}`}
                </span>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] p-2.5 sm:p-3 rounded-2xl font-semibold leading-relaxed shadow ${
                    msg.sender === 'leo'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm">{msg.en}</p>

                  {/* Bilingual Helper Subtitles for Leo's replies */}
                  {msg.sender === 'leo' && (msg.de || msg.tr) && (
                    <div className="mt-1.5 pt-1.5 border-t border-amber-500/40 text-[10px] text-slate-800 space-y-0.5">
                      {msg.de && <p>🇩🇪 {msg.de}</p>}
                      {msg.tr && <p>🇹🇷 {msg.tr}</p>}
                    </div>
                  )}
                </div>

                {/* Audio replay button for Leo */}
                {msg.sender === 'leo' && (
                  <button
                    onClick={() => handleSpeakReply(msg.en)}
                    className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay Voice 🔊</span>
                  </button>
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

          {/* AI Connection status banner */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Channel 1 • {geminiApiKey ? '✨ Gemini AI' : '🧠 Smart Dialog'}</span>
            <span>Mic: {LANGUAGE_OPTIONS.find(l => l.code === micLanguage)?.flag} {LANGUAGE_OPTIONS.find(l => l.code === micLanguage)?.label}</span>
          </div>
        </div>

        {/* Walkie-Talkie Speaker Slits Decoration */}
        <div className="flex items-center justify-center gap-2 my-2.5 w-full opacity-60">
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
        </div>

        {/* TAP-TO-TALK ACTION BUTTON (Supports both Tap to Toggle and Press & Hold) */}
        <div className="w-full flex flex-col items-center gap-1.5">
          <button
            onClick={handleToggleListening}
            className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl font-display font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl cursor-pointer select-none transition transform active:scale-95 border-2 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300 border-red-600'
                : 'bg-slate-900 hover:bg-slate-800 text-yellow-300 border-slate-950'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-5 h-5 animate-bounce text-yellow-300" />
                <span>LISTENING... TAP TO SEND! 🚀</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-amber-400" />
                <span>TAP TO TALK TO LEO 🎙️</span>
              </>
            )}
          </button>

          <p className="text-[11px] font-bold text-amber-950 text-center">
            {isListening
              ? '🗣️ Speak now! Tap button when finished or just pause.'
              : 'Tap button to start talking! Leo replies in cheerful English.'}
          </p>
        </div>

        {/* Text Input Pill (Fallback for typing or quiet environments) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(textInput);
          }}
          className="w-full flex items-center gap-1.5 mt-2 bg-amber-200/90 rounded-xl p-1 border border-amber-500/50"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Or type a message to Leo...`}
            disabled={isLoading || isListening}
            className="flex-1 bg-white px-2.5 py-1 text-xs rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isLoading || isListening}
            className="p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 rounded-lg cursor-pointer transition shadow-xs"
            aria-label="Send text"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Conversation Starter Chips */}
        <div className="w-full mt-2 pt-2 border-t border-amber-600/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-950 mb-1">
            Quick Questions:
          </p>
          <div className="flex flex-wrap gap-1">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading || isListening}
                className="px-2 py-0.5 bg-amber-100 hover:bg-white text-slate-900 rounded-md text-[10px] sm:text-[11px] font-bold shadow-2xs border border-amber-400/50 transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

