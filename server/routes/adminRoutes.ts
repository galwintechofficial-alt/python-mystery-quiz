import { Router, Request, Response } from 'express';
import {
  authenticateAdmin,
  getAdminStats,
  getAdminResults,
  getAdminRanking,
  getAttemptDetail,
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  resetAttempt
} from '../services/adminService.ts';
import { requireAdmin, AdminAuthRequest } from '../middleware/auth.ts';

const router = Router();

// Admin login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const auth = authenticateAdmin(username, password);
    if (!auth.success) {
      return res.status(401).json({ error: auth.message });
    }

    res.json(auth);
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin stats
router.get('/stats', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const stats = getAdminStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch admin stats' });
  }
});

// Admin student results
router.get('/results', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const { search, topic, department, year, status, minScore, maxScore } = req.query;
    const results = getAdminResults({
      search: search as string,
      topic: topic as string,
      department: department as string,
      year: year as string,
      status: status as string,
      minScore: minScore ? Number(minScore) : undefined,
      maxScore: maxScore ? Number(maxScore) : undefined
    });
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch results' });
  }
});

// Admin ranking
router.get('/ranking', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const ranking = getAdminRanking();
    res.json({ ranking });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch ranking' });
  }
});

// Admin single attempt breakdown
router.get('/attempt/:id', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const detail = getAttemptDetail(id);
    if (!detail) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    res.json(detail);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch attempt details' });
  }
});

// Admin reset attempt & unlock student SIC
router.delete('/attempt/:id', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = resetAttempt(id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to reset attempt' });
  }
});

// Admin questions CRUD
router.get('/questions', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const { topic } = req.query;
    const questions = getAllQuestions(topic as string);
    res.json({ questions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch questions' });
  }
});

router.post('/questions', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const { topic, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty } = req.body;
    if (!topic || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer || !explanation || !difficulty) {
      return res.status(400).json({ error: 'All question fields are required.' });
    }

    const created = addQuestion({
      topic,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
      difficulty
    });

    res.status(201).json({ success: true, ...created });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create question' });
  }
});

router.put('/questions/:id', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = updateQuestion(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update question' });
  }
});

router.delete('/questions/:id', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = deleteQuestion(id);
    res.json(deleted);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete question' });
  }
});

// Export CSV of results
router.get('/export/csv', requireAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const results = getAdminResults();
    const headers = [
      'Attempt ID',
      'Name',
      'SIC Number',
      'Department',
      'Year',
      'Topic',
      'Score (out of 200)',
      'Correct',
      'Wrong',
      'Unanswered',
      'Coins Earned',
      'Max Streak',
      'Tab Switches',
      'Status',
      'Auto Submitted',
      'Reason',
      'Time Taken (s)',
      'Submitted At'
    ];

    const rows = results.map((r: any) => [
      r.attempt_id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${r.sic_number}"`,
      `"${r.department}"`,
      `"${r.year}"`,
      `"${r.topic}"`,
      r.score,
      r.correct_count,
      r.wrong_count,
      r.unanswered_count,
      r.coins_earned,
      r.max_streak,
      r.tab_switch_count,
      r.status,
      r.auto_submitted ? 'Yes' : 'No',
      `"${(r.submission_reason || '').replace(/"/g, '""')}"`,
      r.time_taken_seconds || 0,
      `"${r.submitted_at || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="python_mystery_quiz_results.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;
