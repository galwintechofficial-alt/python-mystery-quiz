import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Flame, Coins, Award, Home, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound.ts';
import { Student } from '../types/index.ts';

interface CompletionViewProps {
  student: Student;
  topic: string;
  coinsEarned: number;
  maxStreak: number;
  levelTitle: string;
  avatar: string;
  onHomeClick: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  student,
  topic,
  coinsEarned,
  maxStreak,
  levelTitle,
  avatar,
  onHomeClick,
}) => {
  useEffect(() => {
    sound.playVictory();
    // Fire celebratory confetti cannons
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#fbbf24'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#fbbf24'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden backdrop-blur-xl"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          🎉 Quiz Completed!
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-medium mb-6">
          Your response has been successfully recorded.
        </p>

        {/* Verification Card */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2.5 mb-2.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Submission Receipt
            </span>
            <span className="font-mono text-emerald-400">STATUS: SEALED & RECORDED</span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div>
              <span className="text-slate-500">Student Name:</span>
              <p className="font-semibold text-slate-200">{student.name}</p>
            </div>
            <div>
              <span className="text-slate-500">SIC Number:</span>
              <p className="font-mono font-bold text-amber-400">{student.sic_number}</p>
            </div>
            <div>
              <span className="text-slate-500">Department:</span>
              <p className="text-slate-300">{student.department}</p>
            </div>
            <div>
              <span className="text-slate-500">Topic:</span>
              <p className="text-slate-300">{topic}</p>
            </div>
          </div>
        </div>

        {/* Gamified Rewards Summary */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <Coins className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-lg font-bold text-amber-300">{coinsEarned}</span>
            <span className="text-[11px] text-slate-400">Coins Earned</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <Flame className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-lg font-bold text-orange-400">{maxStreak}</span>
            <span className="text-[11px] text-slate-400">Max Streak</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <Award className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-lg font-bold text-purple-300">{avatar}</span>
            <span className="text-[11px] text-slate-400 truncate w-full text-center">{levelTitle}</span>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-slate-500 mb-6 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          🔒 Under examination privacy rules, detailed test scores, answer keys, and rankings are protected and directly accessible only by department faculty and exam administrators.
        </div>

        <button
          onClick={onHomeClick}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Portal Home</span>
        </button>
      </motion.div>
    </div>
  );
};
