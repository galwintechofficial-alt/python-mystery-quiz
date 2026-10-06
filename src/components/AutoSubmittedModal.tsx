import React from 'react';
import { motion } from 'motion/react';
import { AlertOctagon, Lock, Home } from 'lucide-react';

interface AutoSubmittedModalProps {
  isOpen: boolean;
  reason?: string;
  onReturnHome: () => void;
}

export const AutoSubmittedModal: React.FC<AutoSubmittedModalProps> = ({
  isOpen,
  reason = 'You left the quiz window or switched browser tabs.',
  onReturnHome,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/40 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Quiz Automatically Submitted</h2>

        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-left my-5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Academic Integrity Enforcement</span>
          </div>
          <p className="text-rose-200 text-xs leading-relaxed">
            Your quiz was automatically submitted because you left the quiz window. {reason}
          </p>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          In accordance with examination policies, your response has been sealed and your SIC number is permanently locked for this exam.
        </p>

        <button
          onClick={onReturnHome}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Portal Home</span>
        </button>
      </motion.div>
    </div>
  );
};
