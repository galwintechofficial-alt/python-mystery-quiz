import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { QuestionFull, Topic } from '../types/index.ts';
import {
  getAdminQuestionsApi,
  createAdminQuestionApi,
  updateAdminQuestionApi,
  deleteAdminQuestionApi,
} from '../services/api.ts';

interface AdminQuestionManagerProps {
  token: string;
}

export const AdminQuestionManager: React.FC<AdminQuestionManagerProps> = ({ token }) => {
  const [questions, setQuestions] = useState<QuestionFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionFull | null>(null);

  // Form state
  const [formTopic, setFormTopic] = useState<Topic>('Python Lists');
  const [formText, setFormText] = useState('');
  const [formA, setFormA] = useState('');
  const [formB, setFormB] = useState('');
  const [formC, setFormC] = useState('');
  const [formD, setFormD] = useState('');
  const [formAnswer, setFormAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [token, topicFilter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const topic = topicFilter === 'ALL' ? undefined : topicFilter;
      const data = await getAdminQuestionsApi(token, topic);
      setQuestions(data.questions);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormTopic('Python Lists');
    setFormText('');
    setFormA('');
    setFormB('');
    setFormC('');
    setFormD('');
    setFormAnswer('A');
    setFormExplanation('');
    setFormDifficulty('Easy');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (q: QuestionFull) => {
    setEditingQuestion(q);
    setFormTopic(q.topic);
    setFormText(q.question_text);
    setFormA(q.option_a);
    setFormB(q.option_b);
    setFormC(q.option_c);
    setFormD(q.option_d);
    setFormAnswer(q.correct_answer);
    setFormExplanation(q.explanation);
    setFormDifficulty(q.difficulty);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      if (editingQuestion) {
        await updateAdminQuestionApi(token, editingQuestion.id, {
          topic: formTopic,
          question_text: formText,
          option_a: formA,
          option_b: formB,
          option_c: formC,
          option_d: formD,
          correct_answer: formAnswer,
          explanation: formExplanation,
          difficulty: formDifficulty,
        });
      } else {
        await createAdminQuestionApi(token, {
          topic: formTopic,
          question_text: formText,
          option_a: formA,
          option_b: formB,
          option_c: formC,
          option_d: formD,
          correct_answer: formAnswer,
          explanation: formExplanation,
          difficulty: formDifficulty,
          is_active: 1,
        });
      }
      setModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (q: QuestionFull) => {
    try {
      await updateAdminQuestionApi(token, q.id, {
        is_active: q.is_active ? 0 : 1,
      });
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, is_active: item.is_active ? 0 : 1 } : item))
      );
    } catch (err) {
      console.error('Failed to toggle active:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this question?')) return;
    try {
      await deleteAdminQuestionApi(token, id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const filtered = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase()) ||
    q.explanation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Topic Filter:</span>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400"
          >
            <option value="ALL">All Mystery Box Topics</option>
            <option value="Python Lists">Python Lists</option>
            <option value="Python Variables">Python Variables</option>
            <option value="Python Operators">Python Operators</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Questions List Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading questions...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
          No questions matched your search criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className={`p-4 rounded-xl border transition-all ${
                q.is_active ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold border border-slate-700">
                      {q.topic}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: #{q.id}</span>
                  </div>

                  <p className="text-sm font-semibold text-white font-sans leading-relaxed whitespace-pre-wrap">
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    <div className={`p-2 rounded-lg border ${q.correct_answer === 'A' ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold' : 'bg-slate-950/60 border-slate-800 text-slate-300'}`}>
                      <span className="font-mono text-slate-500 mr-2">A:</span> {q.option_a}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correct_answer === 'B' ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold' : 'bg-slate-950/60 border-slate-800 text-slate-300'}`}>
                      <span className="font-mono text-slate-500 mr-2">B:</span> {q.option_b}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correct_answer === 'C' ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold' : 'bg-slate-950/60 border-slate-800 text-slate-300'}`}>
                      <span className="font-mono text-slate-500 mr-2">C:</span> {q.option_c}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correct_answer === 'D' ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold' : 'bg-slate-950/60 border-slate-800 text-slate-300'}`}>
                      <span className="font-mono text-slate-500 mr-2">D:</span> {q.option_d}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                    <span className="font-semibold text-slate-300">Explanation:</span> {q.explanation}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(q)}
                    title={q.is_active ? 'Deactivate question' : 'Activate question'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      q.is_active
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                        : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {q.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => openEditModal(q)}
                    title="Edit question"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(q.id)}
                    title="Delete question"
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Topic
                  </label>
                  <select
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value as Topic)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Python Lists">Python Lists</option>
                    <option value="Python Variables">Python Variables</option>
                    <option value="Python Operators">Python Operators</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Question Text (supports code snippets on newlines)
                </label>
                <textarea
                  required
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Enter the question text or small code snippet..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Option A
                  </label>
                  <input
                    type="text"
                    required
                    value={formA}
                    onChange={(e) => setFormA(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Option B
                  </label>
                  <input
                    type="text"
                    required
                    value={formB}
                    onChange={(e) => setFormB(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Option C
                  </label>
                  <input
                    type="text"
                    required
                    value={formC}
                    onChange={(e) => setFormC(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Option D
                  </label>
                  <input
                    type="text"
                    required
                    value={formD}
                    onChange={(e) => setFormD(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Correct Answer
                  </label>
                  <select
                    value={formAnswer}
                    onChange={(e) => setFormAnswer(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Explanation
                  </label>
                  <input
                    type="text"
                    required
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Explanation of correct answer..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  {formSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
