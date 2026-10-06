import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Trophy,
  Play
} from 'lucide-react';
import { Navbar } from './components/Navbar.tsx';
import { MysteryBox } from './components/MysteryBox.tsx';
import { StudentRegisterModal } from './components/StudentRegisterModal.tsx';
import { InstructionsModal } from './components/InstructionsModal.tsx';
import { QuizView } from './components/QuizView.tsx';
import { CompletionView } from './components/CompletionView.tsx';
import { AutoSubmittedModal } from './components/AutoSubmittedModal.tsx';
import { BlockedModal } from './components/BlockedModal.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Student, Topic, Question } from './types/index.ts';
import { startQuizApi, checkSicStatusApi } from './services/api.ts';

type AppScreen =
  | 'HOME'
  | 'QUIZ'
  | 'COMPLETED'
  | 'ADMIN_LOGIN'
  | 'ADMIN_DASHBOARD';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('HOME');
  const [student, setStudent] = useState<Student | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState<string>('');
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string>('');

  // Selected Quiz State
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [pendingBoxTopic, setPendingBoxTopic] = useState<Topic | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answeredMap, setAnsweredMap] = useState<Record<number, string>>({});
  const [initialLives, setInitialLives] = useState(3);
  const [initialCoins, setInitialCoins] = useState(0);
  const [initialStreak, setInitialStreak] = useState(0);
  const [initialMaxStreak, setInitialMaxStreak] = useState(0);
  const [initialLevelTitle, setInitialLevelTitle] = useState('Beginner');
  const [initialAvatar, setInitialAvatar] = useState('🧑‍🎓');

  // Completion State
  const [completionData, setCompletionData] = useState<{
    coinsEarned: number;
    maxStreak: number;
    levelTitle: string;
    avatar: string;
  } | null>(null);

  // Admin state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('python_quiz_admin_token') || null;
  });

  // Check URL path for direct admin navigation
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin/login')) {
      setScreen('ADMIN_LOGIN');
    } else if (path.includes('/admin/dashboard') && adminToken) {
      setScreen('ADMIN_DASHBOARD');
    }
  }, [adminToken]);

  // Handle student clicking a mystery box
  const handleBoxSelect = async (topic: Topic) => {
    setSelectedTopic(topic);

    if (!student) {
      setPendingBoxTopic(topic);
      setShowRegisterModal(true);
      return;
    }

    // Verify current student status with backend before starting
    try {
      const statusRes = await checkSicStatusApi(student.sic_number);
      if (statusRes.locked) {
        setBlockedMessage(statusRes.message || 'This SIC number has already been used for this quiz. You cannot attempt the quiz again.');
        setShowBlockedModal(true);
        return;
      }
    } catch {
      // Continue if network status check fails
    }

    // Open instructions before starting
    setShowInstructionsModal(true);
  };

  // Student registration success callback
  const handleRegistrationSuccess = async (
    registeredStudent: Student,
    inProgress?: boolean,
    existingAttemptId?: number,
    existingTopic?: string
  ) => {
    setStudent(registeredStudent);
    setShowRegisterModal(false);

    if (inProgress && existingAttemptId && existingTopic) {
      // Resume existing in-progress attempt directly!
      try {
        const quizData = await startQuizApi(registeredStudent.sic_number, existingTopic);
        setSelectedTopic(existingTopic as Topic);
        setAttemptId(quizData.attemptId);
        setQuestions(quizData.questions);
        setAnsweredMap(quizData.answeredQuestions || {});
        setInitialLives(quizData.livesRemaining);
        setInitialCoins(quizData.coinsEarned);
        setInitialStreak(quizData.currentStreak);
        setInitialMaxStreak(quizData.maxStreak);
        setInitialLevelTitle(quizData.levelTitle);
        setInitialAvatar(quizData.avatar);
        setScreen('QUIZ');
        return;
      } catch (err) {
        console.error('Failed to resume quiz:', err);
      }
    }

    // New registration: continue with selected topic if any, or let student pick
    if (pendingBoxTopic) {
      setSelectedTopic(pendingBoxTopic);
      setPendingBoxTopic(null);
      setShowInstructionsModal(true);
    }
  };

  // Start the actual 20-question quiz after instructions
  const handleStartQuiz = async () => {
    if (!student || !selectedTopic) return;
    setShowInstructionsModal(false);

    try {
      const quizData = await startQuizApi(student.sic_number, selectedTopic);
      setAttemptId(quizData.attemptId);
      setQuestions(quizData.questions);
      setAnsweredMap(quizData.answeredQuestions || {});
      setInitialLives(quizData.livesRemaining);
      setInitialCoins(quizData.coinsEarned);
      setInitialStreak(quizData.currentStreak);
      setInitialMaxStreak(quizData.maxStreak);
      setInitialLevelTitle(quizData.levelTitle);
      setInitialAvatar(quizData.avatar);
      setScreen('QUIZ');
    } catch (err: any) {
      setBlockedMessage(err.message || 'This SIC number has already been used for this quiz. You cannot attempt the quiz again.');
      setShowBlockedModal(true);
    }
  };

  const handleQuizCompleted = (stats: {
    coinsEarned: number;
    maxStreak: number;
    levelTitle: string;
    avatar: string;
  }) => {
    setCompletionData(stats);
    setScreen('COMPLETED');
  };

  const handleAutoSubmitted = (reason?: string) => {
    setAutoSubmitReason(reason || 'Window focus lost or tab switched');
    setShowAutoSubmitModal(true);
  };

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('python_quiz_admin_token', token);
    setScreen('ADMIN_DASHBOARD');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('python_quiz_admin_token');
    setScreen('HOME');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        student={student}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onAdminClick={() => {
          if (adminToken) {
            setScreen('ADMIN_DASHBOARD');
          } else {
            setScreen('ADMIN_LOGIN');
          }
        }}
        onHomeClick={() => setScreen('HOME')}
        onSwitchStudent={() => {
          setStudent(null);
          setShowRegisterModal(true);
        }}
        inQuiz={screen === 'QUIZ'}
      />

      <main className="flex-1 flex flex-col">
        {/* SCREEN 1: HOME LANDING PAGE */}
        {screen === 'HOME' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400 mb-6 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Single-Attempt Collegiate Examination</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight"
              >
                PYTHON{' '}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  MYSTERY QUIZ
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              >
                Choose your challenge and test your Python skills. Unlock an animated mystery box to begin your 20-question speed trial.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4 mt-8"
              >
                <button
                  onClick={() => {
                    if (!student) {
                      setShowRegisterModal(true);
                    } else {
                      // Scroll to mystery boxes
                      const el = document.getElementById('mystery-boxes');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start Quiz</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedTopic('Python Lists');
                    setShowInstructionsModal(true);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Instructions</span>
                </button>
              </motion.div>
            </div>

            {/* Exactly THREE Mystery Boxes */}
            <div id="mystery-boxes" className="scroll-mt-20">
              <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Select Exactly ONE Mystery Box</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Each mystery box unlocks exactly 20 timed questions strictly focused on its topic.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Topic Isolation Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Box 1 */}
                <MysteryBox
                  id={1}
                  topic="Python Lists"
                  subtitle="Indexing, Slicing, Methods & Manipulation"
                  themeColor="amber"
                  onSelect={handleBoxSelect}
                />

                {/* Box 2 */}
                <MysteryBox
                  id={2}
                  topic="Python Variables"
                  subtitle="Identifiers, Dynamic Typing & Assignment"
                  themeColor="emerald"
                  onSelect={handleBoxSelect}
                />

                {/* Box 3 */}
                <MysteryBox
                  id={3}
                  topic="Python Operators"
                  subtitle="Arithmetic, Logical, Identity & Precedence"
                  themeColor="cyan"
                  onSelect={handleBoxSelect}
                />
              </div>
            </div>

            {/* Key Features Banner */}
            <div className="mt-16 pt-12 border-t border-slate-800/80 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">Strict Single Attempt</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    SIC unique constraint verified by SQLite. One attempt permitted per student.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">Anti-Cheat Enforcement</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Automatic submission on tab switch, window exit, or copying attempt.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">Score Privacy</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Scores remain strictly private and accessible only by certified faculty.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: ACTIVE QUIZ VIEW */}
        {screen === 'QUIZ' && student && selectedTopic && attemptId && (
          <QuizView
            student={student}
            topic={selectedTopic}
            attemptId={attemptId}
            initialQuestions={questions}
            initialAnsweredMap={answeredMap}
            initialLives={initialLives}
            initialCoins={initialCoins}
            initialStreak={initialStreak}
            initialMaxStreak={initialMaxStreak}
            initialLevelTitle={initialLevelTitle}
            initialAvatar={initialAvatar}
            onCompleted={handleQuizCompleted}
            onAutoSubmitted={handleAutoSubmitted}
          />
        )}

        {/* SCREEN 3: COMPLETION SCREEN */}
        {screen === 'COMPLETED' && student && selectedTopic && completionData && (
          <CompletionView
            student={student}
            topic={selectedTopic}
            coinsEarned={completionData.coinsEarned}
            maxStreak={completionData.maxStreak}
            levelTitle={completionData.levelTitle}
            avatar={completionData.avatar}
            onHomeClick={() => {
              setScreen('HOME');
              setSelectedTopic(null);
              setStudent(null);
            }}
          />
        )}

        {/* SCREEN 4: ADMIN LOGIN */}
        {screen === 'ADMIN_LOGIN' && (
          <AdminLogin
            onSuccess={handleAdminLoginSuccess}
            onBack={() => setScreen('HOME')}
          />
        )}

        {/* SCREEN 5: ADMIN DASHBOARD */}
        {screen === 'ADMIN_DASHBOARD' && adminToken && (
          <AdminDashboard
            token={adminToken}
            onLogout={handleAdminLogout}
            onReturnToQuiz={() => setScreen('HOME')}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>Python Mystery Quiz Platform · Department Examination System</p>
        <p className="text-slate-500 mt-1">
          Built with React, Express, and SQLite · Strict Topic Isolation
        </p>
      </footer>

      {/* MODALS */}
      <StudentRegisterModal
        isOpen={showRegisterModal}
        onSuccess={handleRegistrationSuccess}
      />

      {selectedTopic && (
        <InstructionsModal
          isOpen={showInstructionsModal}
          topic={selectedTopic}
          onStart={handleStartQuiz}
        />
      )}

      <AutoSubmittedModal
        isOpen={showAutoSubmitModal}
        reason={autoSubmitReason}
        onReturnHome={() => {
          setShowAutoSubmitModal(false);
          setScreen('HOME');
          setSelectedTopic(null);
          setStudent(null);
        }}
      />

      <BlockedModal
        isOpen={showBlockedModal}
        message={blockedMessage}
        sicNumber={student?.sic_number}
        onNewSic={() => {
          setShowBlockedModal(false);
          setStudent(null);
          setShowRegisterModal(true);
        }}
        onClose={() => {
          setShowBlockedModal(false);
          setStudent(null);
          setScreen('HOME');
          setSelectedTopic(null);
        }}
      />
    </div>
  );
}
