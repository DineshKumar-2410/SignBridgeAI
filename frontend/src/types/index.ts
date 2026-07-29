export type ActiveTab = 'sign-to-text' | 'text-to-sign' | 'live' | 'learn' | 'history' | 'train';

export interface HistoryItem {
  id: string;
  timestamp: string;
  sourceType: 'sign' | 'speech' | 'text';
  originalContent: string;
  translatedText: string;
  language: string;
  confidence: number;
}

export interface LearnCategory {
  id: string;
  title: string;
  description: string;
  items: {
    symbol: string;
    signName: string;
    description: string;
    category: string;
  }[];
}

export interface QuizQuestion {
  id: number;
  signName: string;
  symbol: string;
  options: string[];
  correctIndex: number;
}
