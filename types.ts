

export type Points = 200 | 400 | 600;

export interface Question {
  id: string;
  category: string;
  points: Points;
  question: string;
  answer: string;
  imageUrl?: string; // Deprecated but kept for backward compatibility if needed
  questionImg?: string; // Image to show during the question phase
  answerImg?: string;   // Image to show during the answer phase
  isUsed: boolean;
  hint?: string; // Special hint text (e.g. range)
  tier?: number; // 1, 2, or 3
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  questions: Question[];
}

export interface Team {
  name: string;
  score: number;
}

export interface Subscription {
  tier: 'free' | 'plus' | 'pro';
  activationCode: string;
  date: string;
}

export interface GameState {
  teams: [Team, Team];
  currentTurn: number; // 0 or 1
  categories: Category[];
  activeQuestion: Question | null;
  activePowerUps: (keyof PowerUpState)[]; // Supports multiple active powerups
  powerUps: [PowerUpState, PowerUpState];
  gameStatus: 'tierSelection' | 'activation' | 'landing' | 'setup' | 'teams' | 'loading' | 'playing' | 'finished';
  tier?: 'free' | 'plus' | 'pro'; // Captured at game start to lock package type
}

export interface PowerUpState {
  doublePoints: number;
  noPenalty: number;
  twoAnswers: number;
}

// Presentation API Types
declare global {
  interface Navigator {
    presentation?: any;
  }
  interface Window {
    PresentationRequest?: any;
  }
}