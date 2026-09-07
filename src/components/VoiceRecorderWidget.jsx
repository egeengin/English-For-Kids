import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, Sparkles, Check } from 'lucide-react';
import { playSnap, playStarSparkle, playTap } from '../utils/soundEffects';
import { speakEnglish } from '../utils/speech';

export default function VoiceRecorderWidget({
  targetWord = '',
  targetAudioKey = '',
  onRewardEarned,
  isMuted = false,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [hasPracticed, setHasPracticed] = useState(false);
  const [micError, setMicError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const playbackAudioRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up recorded audio blob URLs on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [recordedAudioUrl]);

  // Start recording workflow with child-friendly 3-2-1 countdown
  const handleStartCountdown = async () => {
    playTap(isMuted);
    setMicError(null);

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Microphone not supported on this browser.');
      return;
    }

    try {
      // Pre-request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3-2-1 countdown
      setCountdown(3);
      const cTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(cTimer);
            startActualRecording(stream);
            return null;
          }
          return prev - 1;
        });
      }, 700);
    } catch (err) {
      setMicError('Please allow microphone access to practice speaking!');
    }
  };

  const startActualRecording = (stream) => {
    try {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }
        const newUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(newUrl);
        setIsRecording(false);
        setHasPracticed(true);

        // Stop all mic tracks
        stream.getTracks().forEach((track) => track.stop());

        // Award brick for practicing speaking
        playStarSparkle(isMuted);
        if (onRewardEarned) {
          onRewardEarned({ stars: 1, bricks: 1 });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      playSnap(isMuted);

      // Automatically record for 2.8 seconds (ideal for single words / short phrases)
      timerRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 2800);
    } catch (e) {
      setIsRecording(false);
      setMicError('Could not start recording.');
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Play back child's recording
  const handlePlayback = () => {
    if (!recordedAudioUrl) return;
    playTap(isMuted);

    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
    }

    const audio = new Audio(recordedAudioUrl);
    playbackAudioRef.current = audio;
    setIsPlayingBack(true);

    audio.onended = () => {
      setIsPlayingBack(false);
    };
    audio.onerror = () => {
      setIsPlayingBack(false);
    };

    audio.play().catch(() => {
      setIsPlayingBack(false);
    });
  };

  // Play model native pronunciation
  const handlePlayModel = () => {
    playTap(isMuted);
    speakEnglish(targetAudioKey || targetWord);
  };

  return (
    <div className="w-full bg-emerald-50 rounded-2xl border-2 border-emerald-300 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
      
      {/* Left Info: Mascot Prompt */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md flex-shrink-0">
          🎙️
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-xs text-emerald-950">
              Echo Studio: Speak like Leo!
            </span>
            {hasPracticed && (
              <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.2 rounded-full flex items-center gap-0.5">
                <Check className="w-3 h-3 text-emerald-700" />
                <span>+1 🧱 earned!</span>
              </span>
            )}
          </div>
          <p className="text-[11px] font-bold text-emerald-700">
            Listen to Leo, then record your own voice and listen back!
          </p>
          {micError && (
            <p className="text-[10px] font-bold text-red-600 mt-0.5">{micError}</p>
          )}
        </div>
      </div>

      {/* Right Controls: Model Listen + Record + Playback */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        
        {/* Button 1: Listen to Leo */}
        <button
          onClick={handlePlayModel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-display font-black text-xs shadow-sm transition-all active:scale-95"
          title="Listen to native pronunciation"
        >
          <Volume2 className="w-4 h-4 text-emerald-700" />
          <span>Listen</span>
        </button>

        {/* Button 2: Speak / Record */}
        {countdown !== null ? (
          <div className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-display font-black text-sm shadow-md animate-ping">
            Get Ready... {countdown}
          </div>
        ) : isRecording ? (
          <button
            onClick={handleStopRecording}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 text-white font-display font-black text-xs shadow-md animate-pulse active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Speaking... Stop</span>
          </button>
        ) : (
          <button
            onClick={handleStartCountdown}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>{recordedAudioUrl ? 'Record Again' : 'Speak'}</span>
          </button>
        )}

        {/* Button 3: Listen to Yourself */}
        {recordedAudioUrl && (
          <button
            onClick={handlePlayback}
            disabled={isPlayingBack}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs shadow-md transition-all active:scale-95 ${
              isPlayingBack
                ? 'bg-amber-400 text-slate-950 animate-bounce'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlayingBack ? 'Playing You...' : 'Hear Yourself'}</span>
          </button>
        )}

      </div>

    </div>
  );
}
