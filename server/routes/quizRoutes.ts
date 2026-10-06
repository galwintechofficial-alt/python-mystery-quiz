import { Router, Request, Response } from 'express';
import {
  startQuizAttempt,
  recordQuestionAnswer,
  completeQuizAttempt,
  autoSubmitQuizAttempt,
  checkSicStatus
} from '../services/quizService.ts';
import { queryAll } from '../database/db.ts';

const router = Router();

// Check status by SIC
router.get('/status/:sic', (req: Request, res: Response) => {
  try {
    const { sic } = req.params;
    const status = checkSicStatus(sic);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Start or resume a quiz attempt
router.post('/start', (req: Request, res: Response) => {
  try {
    const { sicNumber, topic } = req.body;
    if (!sicNumber || !topic) {
      return res.status(400).json({ error: 'SIC number and topic are required.' });
    }

    const quizData = startQuizAttempt(sicNumber, topic);
    res.json({ success: true, ...quizData });
  } catch (error: any) {
    console.error('Quiz start error:', error);
    res.status(403).json({ error: error.message || 'Failed to start quiz' });
  }
});

// Get sanitized question list for a topic (NEVER returns correct_answer or explanation)
router.get('/questions/:topic', (req: Request, res: Response) => {
  try {
    const { topic } = req.params;
    const questions = queryAll(
      `SELECT id, topic, question_text, option_a, option_b, option_c, option_d, difficulty
       FROM questions
       WHERE topic = ? AND is_active = 1
       ORDER BY id ASC
       LIMIT 20`,
      [topic]
    );

    if (questions.length !== 20) {
      return res.status(404).json({ error: 'Quiz questions not ready for this topic.' });
    }

    res.json({ questions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Submit answer for a single question
router.post('/answer', (req: Request, res: Response) => {
  try {
    const { attemptId, sicNumber, questionId, selectedAnswer, timeTaken } = req.body;

    if (!attemptId || !sicNumber || !questionId) {
      return res.status(400).json({ error: 'attemptId, sicNumber, and questionId are required.' });
    }

    const result = recordQuestionAnswer(
      Number(attemptId),
      sicNumber,
      Number(questionId),
      selectedAnswer || null,
      Number(timeTaken || 0)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Answer submission error:', error);
    res.status(400).json({ error: error.message || 'Failed to record answer' });
  }
});

// Final submit quiz
router.post('/submit', (req: Request, res: Response) => {
  try {
    const { attemptId, sicNumber } = req.body;
    if (!attemptId || !sicNumber) {
      return res.status(400).json({ error: 'attemptId and sicNumber are required.' });
    }

    const result = completeQuizAttempt(Number(attemptId), sicNumber);
    res.json(result);
  } catch (error: any) {
    console.error('Quiz submit error:', error);
    res.status(400).json({ error: error.message || 'Failed to submit quiz' });
  }
});

// Auto-submit quiz (e.g. window blur / tab switch)
router.post('/auto-submit', (req: Request, res: Response) => {
  try {
    const { attemptId, sicNumber, reason } = req.body;
    if (!attemptId || !sicNumber) {
      return res.status(400).json({ error: 'attemptId and sicNumber are required.' });
    }

    const result = autoSubmitQuizAttempt(
      Number(attemptId),
      sicNumber,
      reason || 'Tab switch / left quiz window'
    );
    res.json(result);
  } catch (error: any) {
    console.error('Auto-submit error:', error);
    res.status(400).json({ error: error.message || 'Failed to auto-submit quiz' });
  }
});

export default router;
