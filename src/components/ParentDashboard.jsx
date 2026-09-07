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
  User,
  Key,
  Eye,
  EyeOff,
  Check,
  Bot,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { speakEnglish, speakTurkish } from '../utils/speech';
import { playTap, playSuccessChime, playGentleWobble } from '../utils/soundEffects';
import { testGeminiApiKey } from '../utils/gemini';

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
  childName = 'Deniz',
  childAge = 7,
  geminiApiKey = '',
  onUpdateProfile,
}) {
  // Child Profile & Gemini AI state
  const [profileName, setProfileName] = useState(childName);
  const [profileAge, setProfileAge] = useState(childAge);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [geminiSaved, setGeminiSaved] = useState(false);

  // New word form state
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newCategory, setNewCategory] = useState('Home');
  const [newHintSentence, setNewHintSentence] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'profile' | 'gemini' | 'words' | 'add'

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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    if (onUpdateProfile) {
      onUpdateProfile({
        childName: profileName.trim(),
        childAge: Number(profileAge) || 7,
        geminiApiKey: apiKeyInput.trim(),
      });
    }
    playSuccessChime(isMuted);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSaveGemini = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        childName: profileName.trim() || 'Deniz',
        childAge: Number(profileAge) || 7,
        geminiApiKey: apiKeyInput.trim(),
      });
    }
    playSuccessChime(isMuted);
    setGeminiSaved(true);
    setTimeout(() => setGeminiSaved(false), 2500);
  };

  const handleTestGeminiConnection = async () => {
    setTestingApiKey(true);
    setApiTestResult(null);
    const res = await testGeminiApiKey(apiKeyInput);
    setTestingApiKey(false);
    setApiTestResult(res);
    if (res.success) {
      playSuccessChime(isMuted);
    } else {
      playGentleWobble(isMuted);
    }
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
              Personalize for {childName}, manage AI voice listening, and track learning progress.
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

      {/* Tabs Bar (Scrollable on small devices) */}
      <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-white border-2 border-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Progress & Stats
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white border-2 border-blue-800 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Child Profile ({profileName})</span>
        </button>
        <button
          onClick={() => setActiveTab('gemini')}
          className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'gemini'
              ? 'bg-purple-600 text-white border-2 border-purple-800 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-300" />
          <span>Gemini AI Voice {apiKeyInput ? '🟢' : '⚪'}</span>
        </button>
        <button
          onClick={() => setActiveTab('words')}
          className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'words'
              ? 'bg-amber-500 text-white border-2 border-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📚 Words ({masteredWords.length}/{allCurriculumItems.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'add'
              ? 'bg-amber-500 text-white border-2 border-amber-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ➕ Custom Words ({customWords.length})
        </button>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Profile & AI Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md">
                👦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-sm sm:text-base text-slate-800">
                    Active Student: {childName} (Age {childAge})
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full border border-blue-300">
                    Trilingual 🇩🇪 🇹🇷 🇬🇧
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  AI Voice Listener: {apiKeyInput ? '✨ Gemini AI Connected' : '🧠 Built-in Phonetics Engine Active'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 font-display font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Customize Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('gemini')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-amber-300" />
                <span>Configure AI</span>
              </button>
            </div>
          </div>

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
              <span className="text-[10px] text-slate-400 font-bold mt-1">{childName}'s accuracy</span>
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
              <span className="text-[10px] text-slate-400 font-bold mt-1">{childName}'s questions</span>
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

      {/* Tab: Child Profile Editor & Personalization */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border-4 border-slate-800 p-4 sm:p-6 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md">
              👦
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-display text-slate-800">
                Child Learning Profile & Customization
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Configure your child's name and age to personalize stories, minifigure builders, and audio prompts.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Child's First Name:
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Deniz"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none text-base font-black font-display text-slate-900 shadow-inner"
                required
              />
              <span className="text-[11px] text-slate-400 font-bold mt-1 block">
                This updates the welcome screen, story dialogues, minifigure workshop, and certificates!
              </span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Child's Age:
              </label>
              <input
                type="number"
                min="3"
                max="14"
                value={profileAge}
                onChange={(e) => setProfileAge(e.target.value)}
                className="w-32 px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-bold text-slate-900"
                required
              />
              <span className="text-[11px] text-slate-400 font-bold ml-3">
                Early reader mode (7 years old) with large tactile hitboxes and trilingual help.
              </span>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900 block">
                👀 Live Product Personalization Preview:
              </span>
              <div className="text-xs text-blue-950 space-y-1 font-bold">
                <div>• Header Branding: <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">{(profileName || 'Deniz').toUpperCase()}'S LEGO ENGLISH</span></div>
                <div>• School Story: <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">"{profileName || 'Deniz'}'s Day at School"</span></div>
                <div>• Mom Character: <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">"Good morning, {profileName || 'Deniz'}! Time for school!"</span></div>
                <div>• Minifigure Workshop: <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">"Dress Up {profileName || 'Deniz'} 👦"</span></div>
                <div>• Echo Studio: <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">"Speak like {profileName || 'Deniz'}!"</span></div>
              </div>
            </div>

            {profileSaved && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-scaleUp">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Profile updated! {profileName} is now personalized across all games! 🎉</span>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-black rounded-xl border-2 border-b-4 border-blue-800 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2 shadow-md text-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Apply Child Profile</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: Gemini AI Settings & Pronunciation Coach */}
      {activeTab === 'gemini' && (
        <div className="bg-white rounded-3xl border-4 border-slate-800 p-4 sm:p-6 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl shadow-md">
              <Bot className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-display text-slate-800">
                  Google Gemini AI Voice Coach
                </h3>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  apiKeyInput ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {apiKeyInput ? 'Key Configured' : 'Local Fallback Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold">
                Listen to {childName}'s voice, understand German & Turkish accents, and give gentle feedback when he speaks!
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveGemini} className="space-y-4 max-w-lg">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gemini API Key:</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 hover:underline"
                >
                  <span>Get Free Key at Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setApiTestResult(null);
                  }}
                  placeholder="AIzaSy..."
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-sm font-mono text-slate-900 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5"
                  title={showApiKey ? 'Hide key' : 'Show key'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-bold mt-1.5 block">
                Saved securely in your browser's private storage. Never shared or uploaded.
              </span>
            </div>

            {/* Test Connection Button & Result */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleTestGeminiConnection}
                disabled={testingApiKey || !apiKeyInput.trim()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-display font-bold text-xs rounded-xl border-2 border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {testingApiKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting to Gemini...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                    <span>Test Connection ⚡</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-display font-black text-xs rounded-xl border-2 border-b-4 border-purple-800 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Gemini Key</span>
              </button>
            </div>

            {apiTestResult && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                apiTestResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {apiTestResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{apiTestResult.message}</span>
              </div>
            )}

            {geminiSaved && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-scaleUp">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Gemini API settings saved successfully! 🚀</span>
              </div>
            )}

            {/* Explanatory Architecture Box */}
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl space-y-2 mt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>How Voice Listening & Gemini AI Work for {childName}:</span>
              </h4>
              <ul className="text-xs text-purple-950 space-y-1.5 font-bold list-disc list-inside">
                <li>
                  <span className="text-slate-800">1. Hands-Free Voice Input:</span> During stories and quizzes, {childName} can press the microphone and speak English out loud.
                </li>
                <li>
                  <span className="text-slate-800">2. Dual-Layer AI Evaluation:</span> If {childName} says "Gud morning" or speaks with Turkish/German intonation, Gemini recognizes the attempt, awards Lego bricks, and praises him!
                </li>
                <li>
                  <span className="text-slate-800">3. Safe Offline Guarantee:</span> If no Gemini key is provided, the app automatically runs our built-in phonetic analyzer, ensuring the game is always 100% playable anywhere!
                </li>
              </ul>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Word Lists & Progress Details */}
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
