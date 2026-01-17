import { Category, Team, Subscription, GameState } from "../types";

export interface GameHistoryItem {
  id: string;
  date: string; // ISO string
  teams: [Team, Team];
  categories: string[]; // Names of categories played
  winnerIndex: number | -1; // -1 for tie
  tier?: 'free' | 'plus' | 'pro'; // Track package type
  usedQuestionIds: string[]; // Track used questions for recycling upon deletion
}

const HISTORY_KEY = 'sinjim_game_history';
const USED_QUESTIONS_BASE_KEY = 'sinjim_used_questions'; 
const UNIFIED_USED_KEY = 'sinjim_used_questions_unified'; // New Unified Key
const SUBSCRIPTION_KEY = 'sinjim_subscription';
const CURRENT_GAME_KEY = 'sinjim_current_game_state';

export const getGameHistory = (): GameHistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading history", e);
    return [];
  }
};

export const saveGameToHistory = (game: Omit<GameHistoryItem, 'id'>) => {
  try {
    const history = getGameHistory();
    const newEntry: GameHistoryItem = {
      ...game,
      id: Date.now().toString(),
    };
    // Keep only last 20 games to allow for more history
    const updatedHistory = [newEntry, ...history].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Error saving history", e);
  }
};

export const deleteGameFromHistory = (gameId: string) => {
  try {
    const history = getGameHistory();
    const updatedHistory = history.filter(g => g.id !== gameId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Error deleting game from history", e);
  }
};

// Helper to get the specific key for a tier
const getUsedKeyForTier = (tier: 'free' | 'plus' | 'pro') => {
  return `${USED_QUESTIONS_BASE_KEY}_${tier}`;
};

/**
 * UNIFIED TRACKING SYSTEM:
 * Returns a consolidated list of ALL used question IDs across all tiers (legacy and new).
 * This ensures that if a user played a question in 'plus', it is marked used in 'pro'.
 */
export const getUsedQuestionIds = (tier?: 'free' | 'plus' | 'pro'): string[] => {
  try {
    // 1. Read the new unified storage
    const unified = JSON.parse(localStorage.getItem(UNIFIED_USED_KEY) || '[]');

    // 2. Read legacy keys to ensure history inheritance (Plus -> Pro)
    // Even if we switched ID formats, we include them to be safe and robust.
    const free = JSON.parse(localStorage.getItem(`${USED_QUESTIONS_BASE_KEY}_free`) || '[]');
    const plus = JSON.parse(localStorage.getItem(`${USED_QUESTIONS_BASE_KEY}_plus`) || '[]');
    const pro = JSON.parse(localStorage.getItem(`${USED_QUESTIONS_BASE_KEY}_pro`) || '[]');
    const legacy = JSON.parse(localStorage.getItem('sinjim_used_questions') || '[]');

    // 3. Deduplicate
    const all = new Set([...unified, ...free, ...plus, ...pro, ...legacy]);
    return Array.from(all);
  } catch (e) {
    return [];
  }
};

export const markQuestionsAsUsed = (questionIds: string[], tier: 'free' | 'plus' | 'pro') => {
  try {
    // 1. Get current unified list (includes legacy reads but we only write back to unified)
    // Note: We don't necessarily want to re-save all legacy data into unified on every write, 
    // but preserving "seen" state is safer.
    const current = getUsedQuestionIds(); 
    
    // 2. Add new IDs
    const updatedUsed = Array.from(new Set([...current, ...questionIds]));
    
    // 3. Save to UNIFIED key only. 
    // This effectively merges history forward into the single persistent array.
    localStorage.setItem(UNIFIED_USED_KEY, JSON.stringify(updatedUsed));
  } catch (e) {
    console.error("Error marking questions as used", e);
  }
};

/**
 * RECYCLING LOGIC:
 * Removes specific question IDs from the Unified list AND Legacy lists.
 * This ensures that if a question was stored in a legacy key, it is also removed there.
 */
export const unmarkQuestionsAsUsed = (questionIds: string[], tier: 'free' | 'plus' | 'pro') => {
  try {
    // 1. Clean Unified Key
    const unified = JSON.parse(localStorage.getItem(UNIFIED_USED_KEY) || '[]');
    const updatedUnified = unified.filter((id: string) => !questionIds.includes(id));
    localStorage.setItem(UNIFIED_USED_KEY, JSON.stringify(updatedUnified));

    // 2. Clean Legacy Keys (Maintenance for older sessions)
    ['free', 'plus', 'pro'].forEach(t => {
       const k = `${USED_QUESTIONS_BASE_KEY}_${t}`;
       const d = JSON.parse(localStorage.getItem(k) || '[]');
       if (d.length > 0) {
          const clean = d.filter((id: string) => !questionIds.includes(id));
          localStorage.setItem(k, JSON.stringify(clean));
       }
    });

    console.log(`Recycled ${questionIds.length} questions.`);
  } catch (e) {
    console.error("Error unmarking questions", e);
  }
};

export const saveSubscription = (sub: Subscription) => {
  try {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  } catch (e) {
    console.error("Error saving subscription", e);
  }
};

export const getSubscription = (): Subscription | null => {
  try {
    const data = localStorage.getItem(SUBSCRIPTION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const removeSubscription = () => {
  localStorage.removeItem(SUBSCRIPTION_KEY);
};

export const resetAllProgress = () => {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(CURRENT_GAME_KEY);
  
  // Clear Unified and Legacy
  localStorage.removeItem(UNIFIED_USED_KEY);
  localStorage.removeItem(`${USED_QUESTIONS_BASE_KEY}_free`);
  localStorage.removeItem(`${USED_QUESTIONS_BASE_KEY}_plus`);
  localStorage.removeItem(`${USED_QUESTIONS_BASE_KEY}_pro`);
  localStorage.removeItem('sinjim_used_questions'); 
};

// --- Game Persistence Functions ---

export const saveCurrentGameState = (state: GameState) => {
  try {
    localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving current game state", e);
  }
};

export const loadCurrentGameState = (): GameState | null => {
  try {
    const data = localStorage.getItem(CURRENT_GAME_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const clearCurrentGameState = () => {
  localStorage.removeItem(CURRENT_GAME_KEY);
};