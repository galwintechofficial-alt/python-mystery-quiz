import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.ts';
import { Student } from '../types/index.ts';

interface NavbarProps {
  student: Student | null;
  onAdminClick: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onHomeClick?: () => void;
  onSwitchStudent?: () => void;
  inQuiz?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  onAdminClick,
  soundEnabled,
  setSoundEnabled,
  onHomeClick,
  onSwitchStudent,
  inQuiz = false,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!inQuiz && onHomeClick) onHomeClick();
            }}
            disabled={inQuiz}
            className={`flex items-center gap-2 text-left group ${inQuiz ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Python Mystery Quiz
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Status / Student Info */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
          {student ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-200 font-semibold">{student.name}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">{student.sic_number}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">{student.department}</span>
              {!inQuiz && onSwitchStudent && (
                <button
                  onClick={onSwitchStudent}
                  className="ml-2 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 transition-colors cursor-pointer"
                  title="Register with a different SIC"
                >
                  Change SIC
                </button>
              )}
            </div>
          ) : (
            <span className="text-slate-500">College Examination Portal</span>
          )}
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="p-2 text-slate-400 hover:text-amber-400 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>

          {!inQuiz && (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
