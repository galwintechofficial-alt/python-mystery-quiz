import React from 'react';
import { motion } from 'motion/react';
import { Lock, UserPlus, Home } from 'lucide-react';

interface BlockedModalProps {
  isOpen: boolean;
  message?: string;
  sicNumber?: string;
  onNewSic: () => void;
  onClose: () => void;
}

export const BlockedModal: React.FC<BlockedModalProps> = ({
  isOpen,
  message = 'This SIC number has already been used for this quiz. You cannot attempt the quiz again.',
  sicNumber,
  onNewSic,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/40 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Quiz Already Attempted</h2>

        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-left my-5">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Single Attempt Policy Enforced</span>
          </div>
          <p className="text-rose-200 text-xs leading-relaxed">
            {message}
          </p>
          {sicNumber && (
            <div className="mt-2 pt-2 border-t border-rose-800/40 font-mono text-[11px] text-rose-300">
              Registered SIC: <span className="font-bold text-amber-300">{sicNumber}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-6">
          To take the quiz with another student ID or for testing, please register with a new SIC number.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onNewSic}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enter Different SIC</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
