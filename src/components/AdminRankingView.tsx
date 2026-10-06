import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Flame, CheckCircle, Search } from 'lucide-react';
import { RankingRow } from '../types/index.ts';
import { getAdminRankingApi } from '../services/api.ts';

interface AdminRankingViewProps {
  token: string;
}

export const AdminRankingView: React.FC<AdminRankingViewProps> = ({ token }) => {
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRanking();
  }, [token]);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const data = await getAdminRankingApi(token);
      setRanking(data.ranking);
    } catch (err) {
      console.error('Failed to load ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = ranking.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.sic_number.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase())
  );

  const getRankBadge = (index: number) => {
    if (index === 0) return <span className="text-xl">🥇</span>;
    if (index === 1) return <span className="text-xl">🥈</span>;
    if (index === 2) return <span className="text-xl">🥉</span>;
    return <span className="font-mono text-xs font-bold text-slate-400">#{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Official Examination Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-400">
            Ranked by Score (descending), followed by Time Taken (fastest completion).
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ranked student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading leaderboard...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
          No submitted quiz attempts found yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((student, idx) => (
            <div
              key={`${student.sic_number}-${idx}`}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                idx === 0
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : idx === 1
                  ? 'bg-slate-800/60 border-slate-700'
                  : idx === 2
                  ? 'bg-amber-900/10 border-amber-800/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                  {getRankBadge(idx)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{student.name}</span>
                    <span className="font-mono text-xs text-amber-400 font-semibold">
                      ({student.sic_number})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{student.department}</span>
                    <span>·</span>
                    <span>{student.year}</span>
                    <span>·</span>
                    <span className="text-slate-300 font-medium">{student.topic}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Score */}
              <div className="flex items-center gap-6 sm:self-center">
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-white">
                    <span className="text-amber-400">{student.score}</span> / 200
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>{student.correct_count} Correct</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
                  <div className="flex items-center gap-1" title="Time taken">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{student.time_taken_seconds || 0}s</span>
                  </div>
                  <div className="flex items-center gap-1" title="Max streak">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{student.max_streak}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
