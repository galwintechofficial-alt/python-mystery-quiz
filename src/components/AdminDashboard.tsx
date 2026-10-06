import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  Download,
  Search,
  Filter,
  Eye,
  LogOut,
  RefreshCw,
  Trophy,
  BookOpen,
  X,
  RotateCcw
} from 'lucide-react';
import { AdminStats, StudentResultRow } from '../types/index.ts';
import { getAdminStatsApi, getAdminResultsApi, getAttemptDetailApi, resetStudentAttemptApi } from '../services/api.ts';
import { AdminRankingView } from './AdminRankingView.tsx';
import { AdminQuestionManager } from './AdminQuestionManager.tsx';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onReturnToQuiz: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  onReturnToQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'rankings' | 'questions'>('results');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [results, setResults] = useState<StudentResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected attempt modal for review
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState<{
    attempt: any;
    answers: any[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, resultsData] = await Promise.all([
        getAdminStatsApi(token),
        getAdminResultsApi(token, {
          search: search || undefined,
          topic: filterTopic || undefined,
          department: filterDept || undefined,
          year: filterYear || undefined,
          status: filterStatus || undefined,
        }),
      ]);
      setStats(statsData);
      setResults(resultsData.results);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const resultsData = await getAdminResultsApi(token, {
        search: search || undefined,
        topic: filterTopic || undefined,
        department: filterDept || undefined,
        year: filterYear || undefined,
        status: filterStatus || undefined,
      });
      setResults(resultsData.results);
    } catch (err) {
      console.error('Failed to apply filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempt = async (attemptId: number) => {
    setLoadingDetail(true);
    try {
      const detail = await getAttemptDetailApi(token, attemptId);
      setSelectedAttemptDetail(detail);
    } catch (err) {
      console.error('Failed to load attempt details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResetAttempt = async (attemptId: number, sicNumber: string) => {
    if (!confirm(`Are you sure you want to reset and unlock SIC ${sicNumber}? This will delete this attempt and allow the student to re-take the quiz.`)) {
      return;
    }
    try {
      await resetStudentAttemptApi(token, attemptId);
      fetchDashboardData();
    } catch (err: any) {
      console.error('Failed to reset attempt:', err);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/admin/export/csv`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Exam Administration Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Python Mystery Quiz Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time examination monitoring, score records, anti-cheat audit logs, and question bank.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={onReturnToQuiz}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            Quiz Portal
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Total Students</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.totalStudents || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Total Attempts</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats?.totalAttempts || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats?.completedAttempts || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Auto Submitted</span>
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats?.autoSubmittedAttempts || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Average Score</span>
          </div>
          <div className="text-2xl font-bold text-purple-300">
            {stats?.avgScore || 0} <span className="text-xs text-slate-500 font-normal">/ 200</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Highest Score</span>
          </div>
          <div className="text-2xl font-bold text-yellow-300">
            {stats?.highestScore || 0} <span className="text-xs text-slate-500 font-normal">/ 200</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Results</span>
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'rankings'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Faculty Ranking</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Question Bank (60)</span>
        </button>
      </div>

      {/* Tab 1: Student Results Table */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or SIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400"
              />
            </div>

            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400"
            >
              <option value="">All Topics</option>
              <option value="Python Lists">Python Lists</option>
              <option value="Python Variables">Python Variables</option>
              <option value="Python Operators">Python Operators</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="AUTO_SUBMITTED">Auto Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>

            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer ml-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Results Table */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">SIC Number</th>
                    <th className="px-4 py-3.5">Dept / Year</th>
                    <th className="px-4 py-3.5">Topic</th>
                    <th className="px-4 py-3.5">Score</th>
                    <th className="px-4 py-3.5">Accuracy</th>
                    <th className="px-4 py-3.5">Time</th>
                    <th className="px-4 py-3.5">Tab Exits</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                        Loading student records...
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                        No examination attempts found.
                      </td>
                    </tr>
                  ) : (
                    results.map((row) => (
                      <tr key={row.attempt_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-white whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-amber-400 font-bold whitespace-nowrap">
                          {row.sic_number}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {row.department} · {row.year}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300 font-medium whitespace-nowrap">
                          {row.topic}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-white whitespace-nowrap">
                          <span className="text-amber-400 text-sm">{row.score}</span> / 200
                        </td>
                        <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                          <span className="text-emerald-400">{row.correct_count}✓</span>{' '}
                          <span className="text-rose-400">{row.wrong_count}✗</span>{' '}
                          <span className="text-slate-500">{row.unanswered_count}⊘</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                          {row.time_taken_seconds || 0}s
                        </td>
                        <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                          {row.tab_switch_count > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/80 font-bold">
                              {row.tab_switch_count} violations
                            </span>
                          ) : (
                            <span className="text-slate-500">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                              row.status === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : row.status === 'AUTO_SUBMITTED'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewAttempt(row.attempt_id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Inspect detailed question choices"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResetAttempt(row.attempt_id, row.sic_number)}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/80 transition-colors"
                              title="Reset attempt and unlock SIC"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rankings */}
      {activeTab === 'rankings' && <AdminRankingView token={token} />}

      {/* Tab 3: Question Management */}
      {activeTab === 'questions' && <AdminQuestionManager token={token} />}

      {/* Detailed Attempt Review Modal */}
      {selectedAttemptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Examination Audit: {selectedAttemptDetail.attempt.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  SIC: {selectedAttemptDetail.attempt.sic_number} · Score:{' '}
                  <span className="text-amber-400 font-bold">
                    {selectedAttemptDetail.attempt.score}/200
                  </span>{' '}
                  · Topic: {selectedAttemptDetail.attempt.topic}
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptDetail(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {selectedAttemptDetail.answers.map((ans, idx) => (
                <div
                  key={ans.id}
                  className={`p-4 rounded-xl border ${
                    ans.is_correct
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : 'bg-rose-950/20 border-rose-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-slate-300">Question {idx + 1}</span>
                    <span
                      className={`font-semibold ${
                        ans.is_correct ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ans.is_correct ? 'CORRECT (+10)' : 'INCORRECT (0)'} · {ans.time_taken}s
                    </span>
                  </div>

                  <p className="text-sm text-white font-medium mb-3 whitespace-pre-wrap">
                    {ans.question_text}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Student Choice: </span>
                      <span className={`font-mono font-bold ${ans.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ans.selected_answer || 'Unanswered (Timed out)'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Correct Key: </span>
                      <span className="font-mono font-bold text-amber-400">
                        Option {ans.correct_answer}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic">
                    Explanation: {ans.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
