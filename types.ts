// --- Data Models ---

export type RightId = 'art1' | 'art2' | 'art3' | 'art5' | 'art16a';
export type CardType = 'hook' | 'intro' | 'explanation' | 'example' | 'boundary' | 'tip' | 'outro';

export interface ScriptCardData {
  type: CardType;
  title: string;
  text: string;
  minWords: number;
}

export interface StarterOption {
  label: string;
  fragment: string;
  suggestions: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// NEU: Fallbeispiel (Anwendung)
export interface CaseCard {
  id: string;
  title: string;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// NEU: Check-Karte (Darf ich das?)
export interface CheckCard {
  id: string;
  statement: string; // "Darf ich..."
  answer: 'yes' | 'no' | 'depends'; // Ja / Nein / Kommt drauf an
  explanation: string;
}

export interface TopicLesson {
  // Lektion A: Verstehen
  introStory: string;
  quizzes: QuizQuestion[];
  // Lektion B: Anwenden (NEU)
  cases: CaseCard[];
  checks: CheckCard[];
}

// NEU: Wort mit Erklärung
export interface WordDef {
  word: string;
  definition: string;
}

export interface PodcastTopic {
  id: RightId;
  title: string;
  simpleTitle: string;
  articleRef: string;
  icon: string;
  description: string;
  lesson: TopicLesson;
  miniExplain: string[];
  keySentence: string;
  exampleIdeas: string[];
  boundaryIdeas: string[];
  schoolTips: string[];
  sentenceStarters: Record<CardType, StarterOption[]>;
  wordBank: WordDef[]; // Updated type
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  condition: (project: PodcastProject) => boolean;
}

export interface PodcastProject {
  teamName: string;
  topicId: RightId;
  script: ScriptCardData[];
  dateCreated: string;
  score: number;
  unlockedBadges: string[];
  // Fortschritt
  introCompleted: boolean; // NEU: Grundgesetz-Basiswissen
  lessonA_Done: boolean; // Basis-Wissen Thema
  lessonB_Done: boolean; // Profi-Check Thema
}