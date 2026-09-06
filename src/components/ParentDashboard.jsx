import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  BookOpen,
  PlusCircle,
  Trash2,
  Volume2,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Tag,
  Smile,
  LogOut,
} from 'lucide-react';
import { speakEnglish, speakTurkish } from '../utils/speech';
import { playTap, playSuccessChime, playGentleWobble } from '../utils/soundEffects';

export default function ParentDashboard({
  streak,
  playtimeMinutes,
  totalQuestionsAnswered,
  masteredWords,
  practicingWords,
  curriculumLevels,
  customWords,
  onAddCustomWord,
  onDeleteCustomWord,
  onResetProgress,
  onCloseDashboard,
  isMuted,
}) {
  // New word form state
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newCategory, setNewCategory] = useState('Home');
  const [newHintSentence, setNewHintSentence] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'words' | 'add'

  // Map all curriculum items for lookup
  const allCurriculumItems = [
    ...curriculumLevels.flatMap(l => l.items),
    ...customWords,
  ];

  const masteredItemsList = allCurriculumItems.filter(item => masteredWords.includes(item.id));
  const practicingItemsList = allCurriculumItems.filter(item => practicingWords.includes(item.id));

  // Form submission
  const handleAddWordSubmit = (e) => {
    e.preventDefault();
    if (!newWord.trim() || !newTranslation.trim()) return;

    const customItem = {
      id: `custom_${Date.now()}`,
      word: newWord.trim().charAt(0).toUpperCase() + newWord.trim().slice(1),
      translation: newTranslation.trim().charAt(0).toUpperCase() + newTranslation.trim().slice(1),
      phonetic: newPhonetic.trim() || newWord.trim(),
      category: newCategory,
      icon: 'Star',
      bgClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      borderClass: 'border-purple-800',
      studColor: '#c084fc',
      hintSentence: newHintSentence.trim() || `Like a nice ${newWord.trim()}! ⭐`,
      hintSentenceTr: `Güzel bir ${newTranslation.trim()} gibi!`,
      dateAdded: new Date().toISOString(),
    };

    onAddCustomWord(customItem);
    playSuccessChime(isMuted);

    // Reset form
    setNewWord('');
    setNewTranslation('');
    setNewPhonetic('');
    setNewHintSentence('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);
  };

  const handleTestAudio = (lang, text) => {
    playTap(isMuted);
    if (!text) return;
    if (lang === 'en') {
      speakEnglish(text);
    } else {
      speakTurkish(text);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl border-4 border-slate-800 p-4 sm:p-6 shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 border-2 border-amber-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-800">
                Parent Dashboard 👨‍👩‍👦
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                PIN Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold">
              Track your child's learning metrics and add customized vocabulary words.
            </p>
          </div>
        </div>

        <button
          onClick={onCloseDashboard}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold rounded-xl border-2 border-slate-300 text-xs flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit to Game</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-white border-2 border-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Progress & Stats
        </button>
        <button
          onClick={() => setActiveTab('words')}
          className={`px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'words'
              ? 'bg-amber-500 text-white border-2 border-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📚 Word Mastery ({masteredWords.length}/{allCurriculumItems.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'add'
              ? 'bg-amber-500 text-white border-2 border-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ➕ Add Custom Words ({customWords.length})
        </button>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border-3 border-amber-300 p-4 shadow-md flex flex-col">
              <div className="flex items-center justify-between text-amber-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Daily Streak</span>
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-2xl sm:text-3xl font-black font-display text-slate-800">
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Keep playing daily! 🔥</span>
            </div>

            <div className="bg-white rounded-2xl border-3 border-blue-300 p-4 shadow-md flex flex-col">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Words Mastered</span>
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-2xl sm:text-3xl font-black font-display text-slate-800">
                {masteredWords.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">First-try accuracy</span>
            </div>

            <div className="bg-white rounded-2xl border-3 border-rose-300 p-4 shadow-md flex flex-col">
              <div className="flex items-center justify-between text-rose-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Needs Practice</span>
                <HelpCircle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-2xl sm:text-3xl font-black font-display text-slate-800">
                {practicingWords.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Hints or retries used</span>
            </div>

            <div className="bg-white rounded-2xl border-3 border-emerald-300 p-4 shadow-md flex flex-col">
              <div className="flex items-center justify-between text-emerald-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Total Answered</span>
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-2xl sm:text-3xl font-black font-display text-slate-800">
                {totalQuestionsAnswered}
              </span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Questions completed</span>
            </div>
          </div>

          {/* Practice Recommendation Alert */}
          {practicingWords.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black font-display text-amber-900">
                  Target Words to Review Together:
                </h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {practicingItemsList.slice(0, 6).map((item) => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-950 flex items-center gap-1 shadow-2xs"
                    >
                      <span>{item.word}</span>
                      <span className="text-slate-400">({item.translation})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reset progress option */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-700">Reset Learning Data</h5>
              <p className="text-[11px] text-slate-400">
                Clear mastered words and stats to start fresh.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all game stats and progress?')) {
                  onResetProgress();
                }
              }}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Word Lists & Progress Details */}
      {activeTab === 'words' && (
        <div className="bg-white rounded-3xl border-4 border-slate-800 p-4 sm:p-6 shadow-xl space-y-6 animate-fadeIn">
          
          {/* Mastered Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-black font-display text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Mastered Words ({masteredItemsList.length})</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">Answered without hints</span>
            </div>

            {masteredItemsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {masteredItemsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-black font-display text-emerald-950">
                        {item.word}
                      </div>
                      <div className="text-xs text-emerald-700">
                        {item.translation}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTestAudio('en', item.word)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                Your child hasn't mastered words yet. Play a few quizzes in the Play tab!
              </p>
            )}
          </div>

          {/* Needs Practice Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-black font-display text-amber-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <span>Words Needing Practice ({practicingItemsList.length})</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">Hints were requested</span>
            </div>

            {practicingItemsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {practicingItemsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-black font-display text-amber-950">
                        {item.word}
                      </div>
                      <div className="text-xs text-amber-700">
                        {item.translation}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTestAudio('en', item.word)}
                      className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                Great job! No words currently need extra practice.
              </p>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Custom Word Entry Form */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-3xl border-4 border-slate-800 p-4 sm:p-6 shadow-xl space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-black font-display text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <span>Add Custom Vocabulary Word</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter words your child is learning at school or home. They will be added to the quiz rotation instantly!
            </p>
          </div>

          <form onSubmit={handleAddWordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* English Word Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  English Word: *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Bicycle, Milk"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestAudio('en', newWord)}
                    disabled={!newWord}
                    className="px-3 py-2 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 text-purple-700 rounded-xl border border-purple-300 flex items-center justify-center transition-colors"
                    title="Test English pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Turkish Translation Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Turkish Translation: *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elma, Bisiklet, Süt"
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestAudio('tr', newTranslation)}
                    disabled={!newTranslation}
                    className="px-3 py-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-700 rounded-xl border border-amber-300 flex items-center justify-center transition-colors"
                    title="Test Turkish pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Phonetic Pronunciation Guide */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phonetic Guide (For Turkish Reader):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ep-pıl, Bay-si-kıl"
                  value={newPhonetic}
                  onChange={(e) => setNewPhonetic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Tag:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-sm font-bold bg-white"
                >
                  <option value="Home">Home & Daily Life</option>
                  <option value="Food">Food & Drinks</option>
                  <option value="School">School & Toys</option>
                  <option value="Nature">Nature & Space</option>
                  <option value="Family">Family & People</option>
                </select>
              </div>

            </div>

            {/* Hint Sentence */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fun Kid Hint Sentence (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Sweet red crunchy fruit! 🍎"
                value={newHintSentence}
                onChange={(e) => setNewHintSentence(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-sm"
              />
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Word added successfully to active learning pool!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-display font-black rounded-xl border-2 border-b-4 border-purple-800 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-md text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Save & Add to Quizzes</span>
            </button>
          </form>

          {/* Active Custom Words List */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-black font-display text-slate-800 mb-3">
              Existing Custom Words ({customWords.length})
            </h4>

            {customWords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customWords.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-display text-slate-800">
                          {item.word}
                        </span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.translation} • <span className="italic">"{item.phonetic}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTestAudio('en', item.word)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Pronounce"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCustomWord(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete word"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No custom words created yet. Use the form above to add your first word!
              </p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
