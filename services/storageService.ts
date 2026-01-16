
import { Category, Team, Subscription, GameState } from "../types";

export interface GameHistoryItem {
  id: string;
  date: string; // ISO string
  teams: [Team, Team];
  categories: string[]; // Names of categories played
  winnerIndex: number | -1; // -1 for tie
}

const HISTORY_KEY = 'sinjim_game_history';
const USED_QUESTIONS_KEY = 'sinjim_used_questions';
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
    // Keep only last 10 games
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Error saving history", e);
  }
};

export const getUsedQuestionIds = (): string[] => {
  try {
    const data = localStorage.getItem(USED_QUESTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const markQuestionsAsUsed = (questionIds: string[]) => {
  try {
    const currentUsed = getUsedQuestionIds();
    // Create a Set to ensure uniqueness efficiently
    const updatedUsed = Array.from(new Set([...currentUsed, ...questionIds]));
    localStorage.setItem(USED_QUESTIONS_KEY, JSON.stringify(updatedUsed));
  } catch (e) {
    console.error("Error marking questions as used", e);
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
  localStorage.removeItem(USED_QUESTIONS_KEY);
  localStorage.removeItem(CURRENT_GAME_KEY);
  // We generally do NOT remove subscription on reset progress, 
  // unless explicitly requested to "Logout"
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