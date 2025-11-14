export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Traditional = 'traditional',
}

export enum Language {
  English = 'English',
  Hindi = 'Hindi',
  Hinglish = 'Hinglish',
}

export interface Answer {
  shortTeaching: string;
  scriptureReference: string;
  scripturePassage: string;
  relatableExample: string;
  actionableSteps: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  answer?: Answer;
  timestamp: string;
  isSaved?: boolean;
}

export interface User {
  id: string;
  username: string;
}

export type SpeechState = 'stopped' | 'playing' | 'paused';

export type FontSize = 'sm' | 'md' | 'lg';