
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

export const getUsedQuestionIds = (tier: 'free' | 'plus' | 'pro'): string[] => {
  try {
    const key = getUsedKeyForTier(tier);
    const data = localStorage.getItem(key);
    // Fallback logic
    if (!data && tier === 'free') {
       const legacy = localStorage.getItem('sinjim_used_questions');
       return legacy ? JSON.parse(legacy) : [];
    }
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const markQuestionsAsUsed = (questionIds: string[], tier: 'free' | 'plus' | 'pro') => {
  try {
    const currentUsed = getUsedQuestionIds(tier);
    const updatedUsed = Array.from(new Set([...currentUsed, ...questionIds]));
    const key = getUsedKeyForTier(tier);
    localStorage.setItem(key, JSON.stringify(updatedUsed));
  } catch (e) {
    console.error("Error marking questions as used", e);
  }
};

/**
 * RECYCLING LOGIC:
 * Removes specific question IDs from the "Used" list, making them available again.
 */
export const unmarkQuestionsAsUsed = (questionIds: string[], tier: 'free' | 'plus' | 'pro') => {
  try {
    const currentUsed = getUsedQuestionIds(tier);
    // Filter out the IDs that we want to recycle
    const updatedUsed = currentUsed.filter(id => !questionIds.includes(id));
    const key = getUsedKeyForTier(tier);
    localStorage.setItem(key, JSON.stringify(updatedUsed));
    console.log(`Recycled ${questionIds.length} questions for tier ${tier}`);
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
