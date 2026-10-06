export type Topic = 'Python Lists' | 'Python Variables' | 'Python Operators';

export interface Student {
  id: number;
  name: string;
  sic_number: string;
  department: string;
  year: string;
}

export interface Question {
  id: number;
  topic: Topic;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuestionFull extends Question {
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  is_active: number;
  created_at: string;
}

export interface QuizAttemptState {
  attemptId: number;
  topic: Topic;
  livesRemaining: number;
  coinsEarned: number;
  currentStreak: number;
  maxStreak: number;
  level: number;
  levelTitle: string;
  avatar: string;
  questions: Question[];
  answeredQuestions: Record<number, string>;
}

export interface AdminStats {
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  autoSubmittedAttempts: number;
  avgScore: number;
  highestScore: number;
  topicStats: { topic: string; count: number; avg_score: number }[];
}

export interface StudentResultRow {
  attempt_id: number;
  name: string;
  sic_number: string;
  department: string;
  year: string;
  topic: Topic;
  score: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  lives_remaining: number;
  coins_earned: number;
  current_streak: number;
  max_streak: number;
  tab_switch_count: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'AUTO_SUBMITTED';
  auto_submitted: number;
  submission_reason: string | null;
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number;
}

export interface RankingRow {
  name: string;
  sic_number: string;
  department: string;
  year: string;
  topic: string;
  score: number;
  correct_count: number;
  max_streak: number;
  status: string;
  submitted_at: string;
  time_taken_seconds: number;
}
