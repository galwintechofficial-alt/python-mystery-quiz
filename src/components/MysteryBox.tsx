import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Box, Lock, CheckCircle2 } from 'lucide-react';
import { Topic } from '../types/index.ts';
import { sound } from '../utils/sound.ts';

interface MysteryBoxProps {
  id: number;
  topic: Topic;
  subtitle: string;
  themeColor: 'amber' | 'emerald' | 'cyan';
  onSelect: (topic: Topic) => void;
  disabled?: boolean;
}

export const MysteryBox: React.FC<MysteryBoxProps> = ({
  id,
  topic,
  subtitle,
  themeColor,
  onSelect,
  disabled = false,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  const colors = {
    amber: {
      border: 'border-amber-500/40 hover:border-amber-400',
      glow: 'shadow-amber-500/20 hover:shadow-amber-500/40',
      bgGlow: 'from-amber-600/20 via-yellow-500/10 to-transparent',
      boxGradient: 'from-amber-500 via-amber-600 to-amber-800',
      accentText: 'text-amber-400',
      ribbon: 'bg-amber-300',
      confetti: ['#f59e0b', '#fbbf24', '#fef08a', '#d97706'],
    },
    emerald: {
      border: 'border-emerald-500/40 hover:border-emerald-400',
      glow: 'shadow-emerald-500/20 hover:shadow-emerald-500/40',
      bgGlow: 'from-emerald-600/20 via-teal-500/10 to-transparent',
      boxGradient: 'from-emerald-500 via-emerald-600 to-emerald-800',
      accentText: 'text-emerald-400',
      ribbon: 'bg-emerald-300',
      confetti: ['#10b981', '#34d399', '#a7f3d0', '#059669'],
    },
    cyan: {
      border: 'border-cyan-500/40 hover:border-cyan-400',
      glow: 'shadow-cyan-500/20 hover:shadow-cyan-500/40',
      bgGlow: 'from-cyan-600/20 via-blue-500/10 to-transparent',
      boxGradient: 'from-cyan-500 via-cyan-600 to-cyan-800',
      accentText: 'text-cyan-400',
      ribbon: 'bg-cyan-300',
      confetti: ['#06b6d4', '#22d3ee', '#a5f3fc', '#0891b2'],
    },
  }[themeColor];

  const handleClick = () => {
    if (disabled || isOpening || isOpened) return;

    setIsOpening(true);
    sound.playBoxOpen();

    // Trigger confetti burst after short delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: colors.confetti,
      });
      setIsOpened(true);
    }, 900);

    // Call onSelect after animation completes
    setTimeout(() => {
      onSelect(topic);
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: id * 0.15 }}
      className="relative group w-full"
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -inset-1 rounded-3xl bg-gradient-to-b ${colors.bgGlow} opacity-30 group-hover:opacity-75 blur-xl transition-opacity duration-500`}
      />

      <div
        onClick={handleClick}
        className={`relative cursor-pointer rounded-2xl bg-slate-900/90 border ${colors.border} p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 shadow-xl ${colors.glow} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
        }`}
      >
        {/* Box Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
            Mystery Box 0{id}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            20 Questions
          </span>
        </div>

        {/* Animated 3D Mystery Box Graphics */}
        <div className="py-6 flex flex-col items-center justify-center relative min-h-[170px]">
          <motion.div
            animate={
              isOpening
                ? {
                    rotate: [0, -8, 8, -12, 12, 0],
                    scale: [1, 1.08, 1.15, 1.2, 1.1],
                    y: [0, -10, -20],
                  }
                : {
                    y: [0, -6, 0],
                  }
            }
            transition={
              isOpening
                ? { duration: 0.9, ease: 'easeInOut' }
                : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
            }
            className="relative"
          >
            {/* Box Lid Animation */}
            <motion.div
              animate={
                isOpening
                  ? {
                      y: -40,
                      rotateX: -45,
                      opacity: 0.8,
                    }
                  : { y: 0, rotateX: 0 }
              }
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`w-28 h-8 rounded-t-xl bg-gradient-to-r ${colors.boxGradient} shadow-md relative z-10 flex items-center justify-center border-b border-black/20`}
            >
              {/* Ribbon bow */}
              <div className={`w-6 h-6 rounded-full ${colors.ribbon} shadow-sm border border-black/10 -mt-2`} />
            </motion.div>

            {/* Box Body */}
            <div
              className={`w-28 h-24 rounded-b-xl bg-gradient-to-b ${colors.boxGradient} shadow-2xl relative flex items-center justify-center overflow-hidden border-t-2 border-white/20`}
            >
              {/* Cross ribbons */}
              <div className={`absolute inset-x-0 h-4 top-1/2 -translate-y-1/2 ${colors.ribbon} opacity-90`} />
              <div className={`absolute inset-y-0 w-4 left-1/2 -translate-x-1/2 ${colors.ribbon} opacity-90`} />

              {/* Box Emblem */}
              <div className="relative z-10 w-10 h-10 rounded-full bg-slate-950/80 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                {isOpened ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Box className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            {/* Opening Light Burst */}
            {isOpening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 2.5, 3] }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl pointer-events-none"
              />
            )}
          </motion.div>

          {/* Reveal Status */}
          <div className="mt-6 text-center">
            {isOpened ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-emerald-400 font-bold text-sm tracking-wide flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>UNLOCKED & REVEALED!</span>
              </motion.div>
            ) : isOpening ? (
              <span className="text-amber-400 font-bold text-sm tracking-wide animate-pulse">
                OPENING MYSTERY BOX...
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                Click to unlock & inspect
              </span>
            )}
          </div>
        </div>

        {/* Box Footer & Topic Label */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                {topic}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>
            <div
              className={`w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform ${colors.accentText}`}
            >
              {disabled ? <Lock className="w-4 h-4 text-slate-500" /> : <Sparkles className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
