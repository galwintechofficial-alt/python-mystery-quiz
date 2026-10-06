import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Timer,
  Heart,
  Flame,
  Coins,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Question, Student } from '../types/index.ts';
import { submitAnswerApi, completeQuizApi, autoSubmitQuizApi } from '../services/api.ts';
import { sound } from '../utils/sound.ts';

interface QuizViewProps {
  student: Student;
  topic: string;
  attemptId: number;
  initialQuestions: Question[];
  initialAnsweredMap?: Record<number, string>;
  initialLives?: number;
  initialCoins?: number;
  initialStreak?: number;
  initialMaxStreak?: number;
  initialLevel?: number;
  initialLevelTitle?: string;
  initialAvatar?: string;
  onCompleted: (stats: {
    coinsEarned: number;
    maxStreak: number;
    levelTitle: string;
    avatar: string;
  }) => void;
  onAutoSubmitted: (reason?: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  student,
  topic,
  attemptId,
  initialQuestions,
  initialAnsweredMap = {},
  initialLives = 3,
  initialCoins = 0,
  initialStreak = 0,
  initialMaxStreak = 0,
  initialLevelTitle = 'Beginner',
  initialAvatar = '🧑‍🎓',
  onCompleted,
  onAutoSubmitted,
}) => {
  // Determine starting index based on already answered questions
  const answeredIds = Object.keys(initialAnsweredMap).map(Number);
  const startIdx = initialQuestions.findIndex((q) => !answeredIds.includes(q.id));
  const [currentIndex, setCurrentIndex] = useState(startIdx !== -1 ? startIdx : 0);

  // Gamification state
  const [lives, setLives] = useState(initialLives);
  const [coins, setCoins] = useState(initialCoins);
  const [streak, setStreak] = useState(initialStreak);
  const [maxStreak, setMaxStreak] = useState(initialMaxStreak);
  const [levelTitle, setLevelTitle] = useState(initialLevelTitle);
  const [avatar, setAvatar] = useState(initialAvatar);

  // Timer state: 10 seconds per question
  const [timeLeft, setTimeLeft] = useState(10);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | 'unanswered';
    coinsAdded?: number;
  } | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const autoSubmittedRef = useRef<boolean>(false);

  const currentQuestion = initialQuestions[currentIndex];
  const isLastQuestion = currentIndex >= initialQuestions.length - 1;

  // TAB SWITCH / WINDOW BLUR DETECTION
  const handleAutoSubmit = useCallback(
    async (reason: string) => {
      if (autoSubmittedRef.current) return;
      autoSubmittedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      sound.playWarning();

      try {
        await autoSubmitQuizApi(attemptId, student.sic_number, reason);
      } catch (err) {
        console.error('Failed to report auto-submit:', err);
      }
      onAutoSubmitted(reason);
    },
    [attemptId, student.sic_number, onAutoSubmitted]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !autoSubmittedRef.current) {
        handleAutoSubmit('Switched browser tab or minimized window');
      }
    };

    const handleWindowBlur = () => {
      if (!autoSubmittedRef.current) {
        handleAutoSubmit('Lost quiz window focus or switched application');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [handleAutoSubmit]);

  // COPY PROTECTION
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+U, Ctrl+S, F12, PrintScreen
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'x', 'v', 'u', 's', 'a', 'p'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12' || e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Finish Quiz Function
  const finalizeQuiz = useCallback(async () => {
    try {
      const res = await completeQuizApi(attemptId, student.sic_number);
      onCompleted({
        coinsEarned: res.coinsEarned || coins,
        maxStreak: res.maxStreak || maxStreak,
        levelTitle: res.levelTitle || levelTitle,
        avatar: res.avatar || avatar,
      });
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      // Still show completion with current local state
      onCompleted({
        coinsEarned: coins,
        maxStreak,
        levelTitle,
        avatar,
      });
    }
  }, [attemptId, student.sic_number, onCompleted, coins, maxStreak, levelTitle, avatar]);

  // Answer handler (called when user clicks or timer expires)
  const handleAnswer = useCallback(
    async (choice: string | null) => {
      if (isLocked || autoSubmittedRef.current) return;
      setIsLocked(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      setSelectedOption(choice);

      try {
        const response = await submitAnswerApi({
          attemptId,
          sicNumber: student.sic_number,
          questionId: currentQuestion.id,
          selectedAnswer: choice,
          timeTaken: Math.min(10, Math.max(0, elapsed)),
        });

        // Update local HUD states
        setLives(response.livesRemaining);
        setStreak(response.currentStreak);
        setMaxStreak(response.maxStreak);
        setCoins(response.coinsEarned);
        setLevelTitle(response.levelTitle);
        setAvatar(response.avatar);

        if (response.isCorrect) {
          const coinsAdded = response.currentStreak >= 3 ? 15 : 10;
          setFeedback({ type: 'correct', coinsAdded });
          sound.playCorrect();

          // Confetti burst for streak or correct
          if (response.currentStreak >= 3) {
            sound.playStreak();
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#ef4444', '#fbbf24'],
            });
          }
        } else if (choice === null) {
          setFeedback({ type: 'unanswered' });
          sound.playWrong();
        } else {
          setFeedback({ type: 'wrong' });
          sound.playWrong();
        }

        // Advance to next question after 800ms
        setTimeout(() => {
          if (isLastQuestion) {
            finalizeQuiz();
          } else {
            setCurrentIndex((prev) => prev + 1);
            setIsLocked(false);
            setSelectedOption(null);
            setFeedback(null);
            setTimeLeft(10);
            startTimeRef.current = Date.now();
          }
        }, 850);
      } catch (err) {
        console.error('Failed to submit answer:', err);
        // Advance anyway to prevent getting stuck
        if (isLastQuestion) {
          finalizeQuiz();
        } else {
          setCurrentIndex((prev) => prev + 1);
          setIsLocked(false);
          setSelectedOption(null);
          setFeedback(null);
          setTimeLeft(10);
          startTimeRef.current = Date.now();
        }
      }
    },
    [
      isLocked,
      attemptId,
      student.sic_number,
      currentQuestion,
      isLastQuestion,
      finalizeQuiz,
    ]
  );

  // Question Timer Countdown
  useEffect(() => {
    setTimeLeft(10);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null); // Auto-submit unanswered when 0
          return 0;
        }
        if (prev <= 4) {
          sound.playTick(true);
        } else {
          sound.playTick(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, handleAnswer]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading quiz questions...
      </div>
    );
  }

  const options = [
    { label: 'A', text: currentQuestion.option_a },
    { label: 'B', text: currentQuestion.option_b },
    { label: 'C', text: currentQuestion.option_c },
    { label: 'D', text: currentQuestion.option_d },
  ];

  const progressPercent = ((currentIndex + 1) / initialQuestions.length) * 100;
  const isUrgent = timeLeft <= 3;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 select-none">
      {/* Quiz HUD Header */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-bold text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60">
              Question <span className="text-amber-400">{currentIndex + 1}</span> / {initialQuestions.length}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-400">
              {topic}
            </span>
          </div>

          {/* Gamified HUD: Hearts, Streak, Coins */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Lives */}
            <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-colors ${
                    heartIndex <= lives
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Streak */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                streak > 0
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 animate-pulse' : ''}`} />
              <span>{streak}</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-2.5 py-1.5 rounded-lg">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{coins}</span>
            </div>

            {/* Level Avatar */}
            <div
              title={`${levelTitle}`}
              className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow-sm"
            >
              {avatar}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden border border-slate-800/80">
          <motion.div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl bg-slate-900 border border-slate-800/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden"
      >
        {/* Anti-cheat watermarking & status */}
        <div className="flex items-center justify-between mb-4 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>EXAM MODE · SIC: {student.sic_number}</span>
          </span>

          {/* 10-Second Timer Dial */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold font-mono transition-all ${
              isUrgent
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-slate-800/80 text-amber-400 border border-slate-700/60'
            }`}
          >
            <Timer className={`w-4 h-4 ${isUrgent ? 'animate-spin' : ''}`} />
            <span className="text-base">{timeLeft}s</span>
          </div>
        </div>

        {/* Question Text & Code Snippet Formatting */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white leading-relaxed font-sans">
            {currentQuestion.question_text.includes('\n') ? (
              <div>
                <p className="mb-3 text-slate-200">
                  {currentQuestion.question_text.split('\n')[0]}
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-sm text-amber-300 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                  {currentQuestion.question_text
                    .split('\n')
                    .slice(1)
                    .join('\n')}
                </div>
              </div>
            ) : (
              currentQuestion.question_text
            )}
          </h2>
        </div>

        {/* Feedback Animation Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`mb-5 p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold shadow-lg ${
                feedback.type === 'correct'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : feedback.type === 'unanswered'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.type === 'correct' && (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>🎉 CORRECT! +{feedback.coinsAdded || 10} Coins</span>
                </>
              )}
              {feedback.type === 'wrong' && (
                <>
                  <span>Nice Try! -1 Life</span>
                </>
              )}
              {feedback.type === 'unanswered' && (
                <>
                  <Timer className="w-4 h-4 text-amber-400" />
                  <span>Time's Up! Moving Forward</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options Grid (A, B, C, D) */}
        <div className="grid grid-cols-1 gap-3">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.label;

            let buttonStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200';
            if (isSelected) {
              if (feedback?.type === 'correct') {
                buttonStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40';
              } else if (feedback?.type === 'wrong') {
                buttonStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
              } else {
                buttonStyle = 'bg-amber-950/60 border-amber-500 text-amber-200 ring-2 ring-amber-500/40';
              }
            }

            return (
              <button
                key={opt.label}
                disabled={isLocked}
                onClick={() => handleAnswer(opt.label)}
                className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all text-sm font-medium ${buttonStyle} ${
                  isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {opt.label}
                </div>
                <span className="flex-1 font-mono pt-0.5 leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info: Strictly No Previous Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Forward progression only · Locked answers</span>
          <span className="font-mono text-amber-400/80">Question {currentIndex + 1} of 20</span>
        </div>
      </motion.div>
    </div>
  );
};
