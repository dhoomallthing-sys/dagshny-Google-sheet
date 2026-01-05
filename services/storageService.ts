
import { Category, Team } from "../types";

export interface GameHistoryItem {
  id: string;
  date: string; // ISO string
  teams: [Team, Team];
  categories: string[]; // Names of categories played
  winnerIndex: number | -1; // -1 for tie
}

const HISTORY_KEY = 'sinjim_game_history';
const USED_QUESTIONS_KEY = 'sinjim_used_questions';

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

export const resetAllProgress = () => {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(USED_QUESTIONS_KEY);
};
