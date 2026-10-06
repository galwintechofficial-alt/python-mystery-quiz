import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, User, Hash, Building2, Calendar, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { registerStudentApi } from '../services/api.ts';
import { Student } from '../types/index.ts';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onSuccess: (student: Student, inProgress?: boolean, attemptId?: number, topic?: string) => void;
  onCancel?: () => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Artificial Intelligence & Data Science',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other / Interdisciplinary'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [sicNumber, setSicNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[1]); // Default 2nd Year
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedAttempt, setBlockedAttempt] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBlockedAttempt(false);

    if (!name.trim()) {
      setError('Student name is required');
      return;
    }
    if (!sicNumber.trim()) {
      setError('SIC Number is required');
      return;
    }

    setLoading(true);
    try {
      const response = await registerStudentApi({
        name: name.trim(),
        sicNumber: sicNumber.trim().toUpperCase(),
        department,
        year,
      });

      if (!response.allowed) {
        setBlockedAttempt(true);
        setError(response.message || 'This SIC number has already been used for this quiz.');
        return;
      }

      onSuccess(response.student, response.inProgress, response.attemptId, response.topic);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('already been used')) {
        setBlockedAttempt(true);
      }
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {blockedAttempt ? (
          /* BLOCKED PERMANENTLY STATE */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Quiz Already Attempted</h2>
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-sm mb-6 text-left">
              <p className="font-semibold text-rose-300">Single Attempt Policy Enforced</p>
              <p className="mt-1 text-xs text-rose-200/80">
                This SIC number ({sicNumber.toUpperCase()}) has already been recorded for this examination. Re-attempts or multiple submissions are strictly disallowed.
              </p>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              If you believe this is a technical error, please contact your examination administrator with your college identity card.
            </p>
            <button
              onClick={() => {
                setBlockedAttempt(false);
                setSicNumber('');
                setError(null);
              }}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Back to Verification
            </button>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Student Verification</h2>
                <p className="text-xs text-slate-400">College Examination Portal Registration</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  SIC Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={sicNumber}
                    onChange={(e) => setSicNumber(e.target.value)}
                    placeholder="e.g. 21BCE1042"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-slate-500 uppercase tracking-wider transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Note: Exactly ONE quiz attempt is permitted per SIC number.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Department <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white transition-colors"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept} className="bg-slate-950 text-white">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Year of Study <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white transition-colors"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y} className="bg-slate-950 text-white">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CONTINUE TO CHALLENGE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};
