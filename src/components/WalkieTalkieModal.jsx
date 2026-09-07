import React, { useState, useEffect, useRef } from 'react';
import { Radio, Mic, MicOff, Volume2, X, Sparkles, Send, MessageSquare, Bot } from 'lucide-react';
import { chatWithLeoGemini } from '../utils/gemini';
import { createSpeechListener, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { speakEnglish, speakGerman, speakTurkish } from '../utils/speech';
import { playSnap, playSparkle, playTap, playSuccess } from '../utils/soundEffects';

const QUICK_PROMPTS = [
  'Hi Leo! 👋',
  'What is your favorite color? 🎨',
  'I like fast race cars! 🏎️',
  'Can we build a rocket? 🚀',
  'I am hungry! 🍕',
  'Dogs or cats? 🐶',
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
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      sender: 'leo',
      en: `Krrch! Over to you, ${childName}! Hold the talk button to chat with me!`,
      de: `Hallo ${childName}! Halte den Knopf gedrückt, um zu sprechen!`,
      tr: `Cızzt! Tamam ${childName}! Benimle konuşmak için düğmeye bas!`,
    },
  ]);

  const speechListenerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isListening]);

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
    const message = (textToSend || speechText || '').trim();
    if (!message) return;

    if (!isMuted) playSnap();

    // Add user message
    setConversation((prev) => [
      ...prev,
      { sender: 'child', en: message },
    ]);
    setSpeechText('');
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
        playSparkle();
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
      alert('Speech recognition is not supported in this browser. You can tap the quick questions below!');
      return;
    }

    if (!isMuted) playTap();
    setSpeechText('');
    setIsListening(true);

    speechListenerRef.current = createSpeechListener({
      onInterim: (interim) => {
        setSpeechText(interim);
      },
      onFinal: (finalText) => {
        setIsListening(false);
        setSpeechText(finalText);
        handleSendMessage(finalText);
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (speechListenerRef.current) {
      speechListenerRef.current.start();
    }
  };

  // Stop speech recognition
  const handleStopListening = () => {
    if (speechListenerRef.current) {
      speechListenerRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSpeakReply = (text) => {
    if (!isMuted && text) {
      speakEnglish(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Walkie-Talkie Device Frame */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-5 shadow-2xl border-4 border-amber-600 flex flex-col items-center">
        
        {/* Rubber Walkie-Talkie Antenna on top */}
        <div className="absolute -top-7 left-12 w-4 h-8 bg-slate-800 rounded-t-lg border-2 border-slate-900 shadow-md">
          <div className="w-2 h-2 rounded-full bg-slate-600 mx-auto mt-1" />
        </div>

        {/* Top Status & Controls Bar */}
        <div className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* LED Status Light */}
            <div className={`w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-400 shadow-sm'
            }`} />
            <span className="font-display font-black text-slate-900 text-sm tracking-wide">
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

        {/* Walkie-Talkie LCD Screen / Chat Window */}
        <div className="w-full h-64 sm:h-72 bg-slate-950 rounded-2xl p-4 border-4 border-slate-800 shadow-inner flex flex-col justify-between overflow-hidden relative">
          
          {/* LCD Scanline effect */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(0deg,#fff,#fff_1px,transparent_1px,transparent_3px)]" />

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'leo' ? 'items-start' : 'items-end'
                }`}
              >
                {/* Speaker Tag */}
                <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  {msg.sender === 'leo' ? '🧱 Leo (Friend)' : `👦 ${childName}`}
                </span>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] p-3 rounded-2xl font-semibold leading-relaxed shadow ${
                    msg.sender === 'leo'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="font-bold text-sm">{msg.en}</p>

                  {/* Bilingual Helper Subtitles for Leo's replies */}
                  {msg.sender === 'leo' && (msg.de || msg.tr) && (
                    <div className="mt-2 pt-2 border-t border-amber-500/40 text-[10px] text-slate-800 space-y-0.5">
                      {msg.de && <p>🇩🇪 {msg.de}</p>}
                      {msg.tr && <p>🇹🇷 {msg.tr}</p>}
                    </div>
                  )}
                </div>

                {/* Audio replay button for Leo */}
                {msg.sender === 'leo' && (
                  <button
                    onClick={() => handleSpeakReply(msg.en)}
                    className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay Voice</span>
                  </button>
                )}
              </div>
            ))}

            {/* Live Listening Transcribing state */}
            {isListening && (
              <div className="flex items-center gap-2 text-yellow-300 animate-pulse text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Listening to {childName}... {speechText ? `"${speechText}"` : ''}</span>
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
            <span>Powered by: {geminiApiKey ? '✨ Gemini AI' : '🧠 Built-in Dialog'}</span>
            <span>Channel 1 • Lego Comms</span>
          </div>
        </div>

        {/* Walkie-Talkie Speaker Slits Decoration */}
        <div className="flex items-center justify-center gap-2 my-3 w-full opacity-60">
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
          <div className="h-1 flex-1 bg-amber-700 rounded-full" />
        </div>

        {/* PUSH-TO-TALK ACTION BUTTON */}
        <div className="w-full flex flex-col items-center gap-2">
          <button
            onMouseDown={handleStartListening}
            onMouseUp={handleStopListening}
            onTouchStart={handleStartListening}
            onTouchEnd={handleStopListening}
            className={`w-full py-3.5 px-6 rounded-2xl font-display font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl cursor-pointer select-none transition transform active:scale-95 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300'
                : 'bg-slate-900 hover:bg-slate-800 text-yellow-300 border-2 border-slate-950'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-6 h-6 animate-bounce" />
                <span>LISTENING... RELEASE TO SEND!</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 text-amber-400" />
                <span>HOLD OR TAP TO TALK TO LEO 🎙️</span>
              </>
            )}
          </button>

          <p className="text-[11px] font-bold text-amber-900 text-center">
            {isListening
              ? '🗣️ Speak now in English, German or Turkish!'
              : 'Press & hold the button and speak into your mic!'}
          </p>
        </div>

        {/* Quick Conversation Starter Chips */}
        <div className="w-full mt-3 pt-3 border-t border-amber-600/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-950 mb-1.5">
            Or tap a question:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading || isListening}
                className="px-2.5 py-1 bg-amber-200/80 hover:bg-white text-slate-900 rounded-lg text-[11px] font-bold shadow-xs border border-amber-500/40 transition cursor-pointer"
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
