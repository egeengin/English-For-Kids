import { useState, useRef, useEffect, useCallback } from 'react';
import {
  createSpeechListener,
  isSpeechRecognitionSupported,
  matchSpokenOption,
} from './speechRecognition';
import { playRadioBeep } from './soundEffects';

/**
 * Shared hook for Voice-to-Answer in multiple-choice quiz cards.
 */
export function useVoiceQuizAnswer({
  options = [],
  questionKey = '',
  isMuted = false,
  onBeforeListen,
  onMatchedOption,
}) {
  const [voiceState, setVoiceState] = useState({
    key: questionKey,
    isListening: false,
    heardText: '',
    voiceNotice: null,
  });
  const listenerRef = useRef(null);
  const handledRef = useRef(false);
  const optionsRef = useRef(options);
  const callbackRef = useRef(onMatchedOption);
  const keyRef = useRef(questionKey);

  useEffect(() => {
    optionsRef.current = options;
    callbackRef.current = onMatchedOption;
    keyRef.current = questionKey;
  });

  const micSupported = isSpeechRecognitionSupported();
  const isCurrentKey = voiceState.key === questionKey;
  const isListening = isCurrentKey ? voiceState.isListening : false;
  const heardText = isCurrentKey ? voiceState.heardText : '';
  const voiceNotice = isCurrentKey ? voiceState.voiceNotice : null;

  const stopVoiceAnswer = useCallback(() => {
    if (listenerRef.current) {
      listenerRef.current.abort();
      listenerRef.current = null;
    }
    setVoiceState((prev) => ({ ...prev, isListening: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        listenerRef.current.abort();
        listenerRef.current = null;
      }
    };
  }, [questionKey]);

  const startVoiceAnswer = useCallback(() => {
    const activeKey = keyRef.current;

    if (!micSupported) {
      setVoiceState({
        key: activeKey,
        isListening: false,
        heardText: '',
        voiceNotice: {
          type: 'error',
          text: 'Mikrofon bu tarayıcıda desteklenmiyor. Şıkka dokunabilirsin!',
        },
      });
      return;
    }

    if (isListening) {
      if (listenerRef.current) listenerRef.current.stop();
      setVoiceState((prev) => ({ ...prev, isListening: false }));
      return;
    }

    if (onBeforeListen) onBeforeListen();
    if (!isMuted) playRadioBeep(false);

    if (listenerRef.current) {
      listenerRef.current.abort();
    }

    handledRef.current = false;
    setVoiceState({
      key: activeKey,
      isListening: true,
      heardText: '',
      voiceNotice: null,
    });

    const listener = createSpeechListener({
      lang: 'en-US',
      onResult: ({ transcript, isFinal } = {}) => {
        if (transcript) {
          setVoiceState((prev) =>
            prev.key === activeKey ? { ...prev, heardText: transcript } : prev
          );
        }
        if (!isFinal || !transcript || handledRef.current) return;

        handledRef.current = true;
        const matched = matchSpokenOption(transcript, optionsRef.current);
        setVoiceState({
          key: activeKey,
          isListening: false,
          heardText: transcript,
          voiceNotice: matched
            ? {
                type: 'matched',
                text: matched.isCorrect
                  ? '🎙️ Sesli Cevap: +2 ⭐!'
                  : `🎙️ "${matched.textEn}" seçildi`,
              }
            : {
                type: 'retry',
                text: `"${transcript}" duyuldu. Tekrar söyle veya şıkka tıkla!`,
              },
        });
        if (matched && callbackRef.current) {
          callbackRef.current(matched, transcript);
        }
      },
      onError: (_, errorType) => {
        const msg =
          errorType === 'not-allowed' || errorType === 'permission-denied'
            ? 'Mikrofon izni kapalı. İzin ver veya şıkka tıkla!'
            : 'Ses duyulmadı. Tekrar deneyebilir veya şıkka tıklayabilirsin!';
        setVoiceState((prev) => ({
          key: activeKey,
          isListening: false,
          heardText: prev.key === activeKey ? prev.heardText : '',
          voiceNotice: { type: 'error', text: msg },
        }));
      },
      onEnd: () => {
        setVoiceState((prev) =>
          prev.key === activeKey ? { ...prev, isListening: false } : prev
        );
      },
    });

    if (listener) {
      listenerRef.current = listener;
      listener.start();
    } else {
      setVoiceState((prev) => ({ ...prev, isListening: false }));
    }
  }, [micSupported, isListening, isMuted, onBeforeListen]);

  return {
    isListening,
    heardText,
    voiceNotice,
    micSupported,
    startVoiceAnswer,
    stopVoiceAnswer,
  };
}
