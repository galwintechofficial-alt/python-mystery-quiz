import React from 'react';
import { motion } from 'motion/react';
import {
  Timer,
  AlertTriangle,
  RotateCcw,
  EyeOff,
  Copy,
  Lock,
  ArrowRight,
  Flame,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Topic } from '../types/index.ts';

interface InstructionsModalProps {
  isOpen: boolean;
  topic: Topic;
  onStart: () => void;
  onClose?: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  topic,
  onStart,
}) => {
  if (!isOpen) return null;

  const rules = [
    {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      title: '20 Topic-Specific Questions',
      desc: `All 20 questions will strictly cover "${topic}".`,
    },
    {
      icon: <Timer className="w-4 h-4 text-amber-400" />,
      title: '10 Seconds Per Question',
      desc: 'Each question has an individual 10-second countdown. Auto-advances on 0.',
    },
    {
      icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
      title: 'No Previous Button',
      desc: 'Progression is strictly forward (Question 1 to 20). No revisions allowed.',
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      title: 'Tab Switch / Window Exit Auto-Submit',
      desc: 'Switching browser tabs, minimizing, or losing window focus immediately auto-submits your quiz.',
    },
    {
      icon: <Lock className="w-4 h-4 text-amber-400" />,
      title: 'One SIC Number = One Attempt',
      desc: 'Your college SIC number is permanently locked after submission.',
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      title: 'Do Not Refresh The Page',
      desc: 'Keep the quiz tab active. Refreshing may trigger lockouts.',
    },
    {
      icon: <EyeOff className="w-4 h-4 text-indigo-400" />,
      title: 'Confidential Score Policy',
      desc: 'Final test scores and answers are strictly confidential and visible only to examination admins.',
    },
    {
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      title: 'Lives & Streak System',
      desc: 'Start with 3 ❤️ lives. Earn streaks 🔥 and coins 🪙 as you answer accurately.',
    },
    {
      icon: <Copy className="w-4 h-4 text-slate-400" />,
      title: 'Copy Protection Enabled',
      desc: 'Text selection, right-click, and shortcut copying are disabled on exam content.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Examination Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Rules & Instructions: <span className="text-amber-400">{topic}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Please read these requirements carefully before initiating the timed challenge.
          </p>
        </div>

        {/* Scrollable Rules List */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-800/40">
          {rules.map((rule, idx) => (
            <div key={idx} className="pt-3 first:pt-0 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                {rule.icon}
              </div>
              <div className="text-xs">
                <h4 className="font-semibold text-slate-200">{rule.title}</h4>
                <p className="text-slate-400 mt-0.5 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            By clicking start, you agree to adhere to all academic integrity policies.
          </div>
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all shrink-0"
          >
            <span>I Understand - Start Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
