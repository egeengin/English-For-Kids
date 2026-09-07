/**
 * LocalStorage persistence layer for Lego English Adventure.
 */

const STORAGE_KEY = 'lego_english_adventure_state_v1';

export const INITIAL_STATE = {
  childName: 'Deniz', // Customizable for white-labeling / selling as a product
  childAge: 7,
  stars: 0,
  bricks: 4, // Initial starter bricks so child can immediately explore builder!
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  playtimeMinutes: 1,
  totalQuestionsAnswered: 0,
  masteredWords: [], // IDs of words mastered without hints
  practicingWords: [], // IDs of words where hints/retries occurred
  unlockedStages: {
    rocket: [1], // First stage starts unlocked to demonstrate builder!
    racecar: [],
    castle: []
  },
  unlockedAccessories: ['cap'],
  equippedAccessory: 'cap',
  customWords: [],
  soundMuted: false,
  geminiApiKey: '',
};

/**
 * Load state from localStorage with safe fallback
 */
export function loadSavedState() {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    
    // Update streak if it's a new day
    const today = new Date().toISOString().split('T')[0];
    let streak = parsed.streak || 1;
    if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    return {
      ...INITIAL_STATE,
      ...parsed,
      childName: (parsed.childName && parsed.childName.trim()) || 'Deniz',
      childAge: Number(parsed.childAge) || 7,
      geminiApiKey: parsed.geminiApiKey || '',
      streak,
      lastActiveDate: today,
    };
  } catch (err) {
    console.warn('Failed to parse saved state, using initial state:', err);
    return INITIAL_STATE;
  }
}

/**
 * Save updated state to localStorage
 */
export function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}
