import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Trash2, Plus, Volume2, Sparkles, RefreshCw, Layers, Check, Download } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playSnap, playSparkle, playTap, playSuccess } from '../utils/soundEffects';

const SCENES = [
  {
    id: 'park',
    name: 'Sunny Park 🌳',
    bgGradient: 'from-sky-300 via-emerald-200 to-emerald-500',
    groundColor: 'bg-emerald-600',
    groundBorder: 'border-emerald-700',
  },
  {
    id: 'school',
    name: 'Schoolyard 🏫',
    bgGradient: 'from-amber-100 via-yellow-200 to-slate-300',
    groundColor: 'bg-slate-700',
    groundBorder: 'border-slate-800',
  },
  {
    id: 'space',
    name: 'Space Base 🚀',
    bgGradient: 'from-slate-950 via-indigo-950 to-purple-900',
    groundColor: 'bg-slate-800',
    groundBorder: 'border-slate-900',
  },
];

const STICKER_PALETTE = [
  { id: 'deniz', word: 'Deniz', emoji: '👦', de: 'Deniz', tr: 'Deniz' },
  { id: 'leo', word: 'Leo the Builder', emoji: '👷', de: 'Leo Baumeister', tr: 'Usta Leo' },
  { id: 'school_bus', word: 'School Bus', emoji: '🚌', de: 'Schulbus', tr: 'Okul Otobüsü' },
  { id: 'race_car', word: 'Race Car', emoji: '🏎️', de: 'Rennauto', tr: 'Yarış Arabası' },
  { id: 'rocket', word: 'Rocket', emoji: '🚀', de: 'Rakete', tr: 'Roket' },
  { id: 'dog', word: 'Dog', emoji: '🐶', de: 'Hund', tr: 'Köpek' },
  { id: 'cat', word: 'Cat', emoji: '🐱', de: 'Katze', tr: 'Kedi' },
  { id: 'tree', word: 'Tree', emoji: '🌳', de: 'Baum', tr: 'Ağaç' },
  { id: 'balloons', word: 'Balloons', emoji: '🎈', de: 'Ballons', tr: 'Balonlar' },
  { id: 'trophy', word: 'Trophy', emoji: '🏆', de: 'Pokal', tr: 'Kupa' },
  { id: 'ice_cream', word: 'Ice Cream', emoji: '🍦', de: 'Eis', tr: 'Dondurma' },
  { id: 'red_brick', word: 'Red Brick', emoji: '🧱', de: 'Roter Stein', tr: 'Kırmızı Tuğla' },
  { id: 'star', word: 'Star', emoji: '⭐', de: 'Stern', tr: 'Yıldız' },
  { id: 'sun', word: 'Sun', emoji: '☀️', de: 'Sonne', tr: 'Güneş' },
];

export default function LegoDiorama({
  initialItems = [],
  onSaveItems,
  isMuted = false,
  childName = 'Deniz',
}) {
  const [currentSceneId, setCurrentSceneId] = useState('park');
  const [items, setItems] = useState(() => {
    if (initialItems && initialItems.length > 0) return initialItems;
    return [
      { id: 'd-1', word: 'Deniz', emoji: '👦', x: 25, y: 60, scale: 1 },
      { id: 'd-2', word: 'School Bus', emoji: '🚌', x: 55, y: 50, scale: 1.2 },
      { id: 'd-3', word: 'Dog', emoji: '🐶', x: 78, y: 65, scale: 0.9 },
    ];
  });
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [activeAudioWord, setActiveAudioWord] = useState(null);
  const [showPhotoFlash, setShowPhotoFlash] = useState(false);
  const [photoGallery, setPhotoGallery] = useState([]);
  const canvasRef = useRef(null);

  const activeScene = SCENES.find((s) => s.id === currentSceneId) || SCENES[0];

  // Add sticker to diorama canvas
  const handleAddSticker = (sticker) => {
    if (!isMuted) {
      playSnap();
      speakEnglish(sticker.word);
    }

    const newItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      word: sticker.word,
      emoji: sticker.emoji,
      de: sticker.de,
      tr: sticker.tr,
      x: 35 + Math.random() * 30,
      y: 40 + Math.random() * 30,
      scale: 1,
    };

    const updated = [...items, newItem];
    setItems(updated);
    setSelectedItemId(newItem.id);
    if (onSaveItems) onSaveItems(updated);
  };

  // Click placed sticker to speak English and show translations
  const handleClickItem = (item, e) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setActiveAudioWord(item);

    if (!isMuted) {
      playTap();
      speakEnglish(item.word);
    }
  };

  // Delete placed sticker
  const handleDeleteSelected = () => {
    if (!selectedItemId) return;
    if (!isMuted) playTap();
    const updated = items.filter((it) => it.id !== selectedItemId);
    setItems(updated);
    setSelectedItemId(null);
    setActiveAudioWord(null);
    if (onSaveItems) onSaveItems(updated);
  };

  // Reset / Clear scene
  const handleClearScene = () => {
    if (!isMuted) playTap();
    setItems([]);
    setSelectedItemId(null);
    setActiveAudioWord(null);
    if (onSaveItems) onSaveItems([]);
  };

  // Take Snapshot Photo
  const handleTakePhoto = () => {
    if (!isMuted) {
      playSuccess();
      playSparkle();
    }
    setShowPhotoFlash(true);
    setTimeout(() => setShowPhotoFlash(false), 400);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
    });

    const newPhoto = {
      id: `photo-${Date.now()}`,
      sceneName: activeScene.name,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      itemCount: items.length,
    };
    setPhotoGallery((prev) => [newPhoto, ...prev]);
  };

  return (
    <div className="w-full max-w-5xl px-4 py-6 flex flex-col items-center animate-fade-in">
      
      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-md border-2 border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-2xl shadow-inner border border-purple-600 text-white">
            🏙️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
              {childName}'s Lego Town Diorama 🎨
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Drag and drop stickers to build your own Lego world!
            </p>
          </div>
        </div>

        {/* Scene Switcher Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                if (!isMuted) playTap();
                setCurrentSceneId(scene.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentSceneId === scene.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {scene.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Diorama Canvas */}
      <div
        ref={canvasRef}
        onClick={() => {
          setSelectedItemId(null);
          setActiveAudioWord(null);
        }}
        className={`w-full h-80 sm:h-96 rounded-3xl relative overflow-hidden shadow-2xl border-4 border-slate-800 bg-gradient-to-b ${activeScene.bgGradient} cursor-default select-none`}
      >
        {/* Camera Flash Animation */}
        {showPhotoFlash && (
          <div className="absolute inset-0 bg-white z-40 animate-ping opacity-90" />
        )}

        {/* Clouds / Sun / Stars Decor */}
        {currentSceneId === 'park' && (
          <>
            <div className="absolute top-6 left-10 text-4xl opacity-80 animate-pulse">☁️</div>
            <div className="absolute top-10 right-16 text-4xl opacity-80">☁️</div>
            <div className="absolute top-4 right-6 text-5xl animate-spin-slow">☀️</div>
          </>
        )}

        {currentSceneId === 'space' && (
          <>
            <div className="absolute top-8 left-12 text-2xl text-yellow-200 animate-pulse">✨</div>
            <div className="absolute top-16 right-24 text-3xl text-purple-200 animate-pulse">🪐</div>
            <div className="absolute top-6 right-8 text-2xl text-cyan-200 animate-pulse">⭐</div>
          </>
        )}

        {/* Stud Ground Baseplate */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-28 sm:h-32 ${activeScene.groundColor} border-t-4 ${activeScene.groundBorder}`}
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Placed Stickers */}
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => handleClickItem(item, e)}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `scale(${item.scale || 1})`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150 group z-20 ${
                isSelected
                  ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-2xl animate-bounce'
                  : 'hover:scale-110'
              }`}
            >
              <div className="text-5xl sm:text-6xl filter drop-shadow-lg select-none">
                {item.emoji}
              </div>

              {/* Hover / Active Word Label */}
              <div
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] font-black shadow-md border ${
                  isSelected
                    ? 'bg-yellow-400 text-slate-950 border-amber-500 opacity-100'
                    : 'bg-slate-900/80 text-white border-slate-700 opacity-0 group-hover:opacity-100'
                } transition`}
              >
                {item.word} 🔊
              </div>
            </div>
          );
        })}

        {/* Active Item Audio Translator Banner (In Canvas) */}
        {activeAudioWord && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border-2 border-yellow-400 flex items-center gap-3 text-xs animate-scale-up">
            <span className="text-xl">{activeAudioWord.emoji}</span>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="font-black text-sm text-slate-900">{activeAudioWord.word}</span>
              {activeAudioWord.de && <span className="text-slate-500">🇩🇪 {activeAudioWord.de}</span>}
              {activeAudioWord.tr && <span className="text-slate-500">🇹🇷 {activeAudioWord.tr}</span>}
            </div>
            <button
              onClick={() => speakEnglish(activeAudioWord.word)}
              className="p-1.5 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-slate-950 cursor-pointer transition"
              title="Hear word again"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Snapshot Shutter Button Overlay */}
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
          {selectedItemId && (
            <button
              onClick={handleDeleteSelected}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg cursor-pointer transition active:scale-95"
              title="Remove sticker"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleTakePhoto}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-sm rounded-2xl shadow-xl border-2 border-amber-500 cursor-pointer transition active:scale-95"
          >
            <Camera className="w-5 h-5" />
            <span>SNAP PHOTO 📸</span>
          </button>
        </div>

        {/* Reset / Empty Scene */}
        <div className="absolute bottom-4 left-4 z-30">
          <button
            onClick={handleClearScene}
            className="p-2.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
            title="Clear all stickers"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* STICKER PALETTE TRAY */}
      <div className="w-full mt-6 bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Tap any sticker to add it to {childName}'s Town:</span>
          </p>
          <span className="text-xs font-bold text-slate-400">
            {items.length} items placed
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {STICKER_PALETTE.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleAddSticker(sticker)}
              className="group flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-yellow-50 text-slate-900 rounded-xl border-2 border-slate-200 hover:border-yellow-400 shadow-xs transition transform active:scale-95 cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">
                {sticker.emoji}
              </span>
              <span className="text-xs font-bold">{sticker.word}</span>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-yellow-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot Gallery Feed */}
      {photoGallery.length > 0 && (
        <div className="w-full mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm animate-fade-in">
          <h3 className="font-display font-black text-sm text-slate-900 mb-2 flex items-center gap-2">
            <span>📸 {childName}'s Souvenir Album</span>
            <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
              {photoGallery.length} Photos
            </span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {photoGallery.map((photo) => (
              <div
                key={photo.id}
                className="bg-white p-3 rounded-xl border-2 border-amber-300 shadow-sm flex items-center gap-3 text-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-xl">
                  🖼️
                </div>
                <div>
                  <p className="font-bold text-slate-800">{photo.sceneName}</p>
                  <p className="text-[10px] text-slate-400">{photo.date} • {photo.itemCount} stickers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
