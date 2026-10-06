import bcrypt from 'bcryptjs';
import { queryAll, queryOne, runQuery, saveDb } from '../database/db.ts';
import { generateAdminToken } from '../middleware/auth.ts';

export function authenticateAdmin(username: string, passwordPlain: string) {
  const admin = queryOne<{ id: number; username: string; password_hash: string }>(
    'SELECT * FROM admins WHERE username = ?',
    [username.trim()]
  );

  if (!admin) {
    return { success: false, message: 'Invalid admin credentials' };
  }

  const valid = bcrypt.compareSync(passwordPlain, admin.password_hash);
  if (!valid) {
    return { success: false, message: 'Invalid admin credentials' };
  }

  const token = generateAdminToken({ id: admin.id, username: admin.username });
  return {
    success: true,
    token,
    admin: { id: admin.id, username: admin.username }
  };
}

export function getAdminStats() {
  const totalStudents = queryOne<{ count: number }>('SELECT COUNT(*) AS count FROM students')?.count || 0;
  const totalAttempts = queryOne<{ count: number }>('SELECT COUNT(*) AS count FROM quiz_attempts')?.count || 0;
  const completedAttempts = queryOne<{ count: number }>(
    "SELECT COUNT(*) AS count FROM quiz_attempts WHERE status = 'COMPLETED'"
  )?.count || 0;
  const autoSubmittedAttempts = queryOne<{ count: number }>(
    "SELECT COUNT(*) AS count FROM quiz_attempts WHERE status = 'AUTO_SUBMITTED'"
  )?.count || 0;

  const scoreStats = queryOne<{ avgScore: number; maxScore: number }>(
    "SELECT AVG(score) AS avgScore, MAX(score) AS maxScore FROM quiz_attempts WHERE status IN ('COMPLETED', 'AUTO_SUBMITTED')"
  );

  const avgScore = scoreStats && scoreStats.avgScore ? Math.round(scoreStats.avgScore * 10) / 10 : 0;
  const highestScore = scoreStats && scoreStats.maxScore ? scoreStats.maxScore : 0;

  // Topic distribution
  const topicStats = queryAll<{ topic: string; count: number; avg_score: number }>(
    `SELECT topic, COUNT(*) AS count, ROUND(AVG(score), 1) AS avg_score
     FROM quiz_attempts
     WHERE status IN ('COMPLETED', 'AUTO_SUBMITTED')
     GROUP BY topic`
  );

  return {
    totalStudents,
    totalAttempts,
    completedAttempts,
    autoSubmittedAttempts,
    avgScore,
    highestScore,
    topicStats
  };
}

export interface ResultsFilter {
  search?: string;
  topic?: string;
  department?: string;
  year?: string;
  status?: string;
  minScore?: number;
  maxScore?: number;
}

export function getAdminResults(filters: ResultsFilter = {}) {
  let sql = `
    SELECT
      a.id AS attempt_id,
      s.name,
      s.sic_number,
      s.department,
      s.year,
      a.topic,
      a.score,
      a.correct_count,
      a.wrong_count,
      a.unanswered_count,
      a.lives_remaining,
      a.coins_earned,
      a.current_streak,
      a.max_streak,
      a.tab_switch_count,
      a.status,
      a.auto_submitted,
      a.submission_reason,
      a.started_at,
      a.submitted_at,
      ROUND((JULIANDAY(COALESCE(a.submitted_at, CURRENT_TIMESTAMP)) - JULIANDAY(a.started_at)) * 86400) AS time_taken_seconds
    FROM quiz_attempts a
    JOIN students s ON a.student_id = s.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.search) {
    sql += ' AND (s.name LIKE ? OR s.sic_number LIKE ?)';
    const term = `%${filters.search.trim()}%`;
    params.push(term, term);
  }

  if (filters.topic) {
    sql += ' AND a.topic = ?';
    params.push(filters.topic);
  }

  if (filters.department) {
    sql += ' AND s.department = ?';
    params.push(filters.department);
  }

  if (filters.year) {
    sql += ' AND s.year = ?';
    params.push(filters.year);
  }

  if (filters.status) {
    sql += ' AND a.status = ?';
    params.push(filters.status);
  }

  if (filters.minScore !== undefined && !isNaN(filters.minScore)) {
    sql += ' AND a.score >= ?';
    params.push(filters.minScore);
  }

  if (filters.maxScore !== undefined && !isNaN(filters.maxScore)) {
    sql += ' AND a.score <= ?';
    params.push(filters.maxScore);
  }

  sql += ' ORDER BY a.submitted_at DESC, a.id DESC';

  return queryAll(sql, params);
}

export function getAdminRanking() {
  const sql = `
    SELECT
      s.name,
      s.sic_number,
      s.department,
      s.year,
      a.topic,
      a.score,
      a.correct_count,
      a.max_streak,
      a.status,
      a.submitted_at,
      ROUND((JULIANDAY(COALESCE(a.submitted_at, CURRENT_TIMESTAMP)) - JULIANDAY(a.started_at)) * 86400) AS time_taken_seconds
    FROM quiz_attempts a
    JOIN students s ON a.student_id = s.id
    WHERE a.status IN ('COMPLETED', 'AUTO_SUBMITTED')
    ORDER BY a.score DESC, time_taken_seconds ASC, a.submitted_at ASC
    LIMIT 100
  `;
  return queryAll(sql);
}

export function getAttemptDetail(attemptId: number) {
  const attempt = queryOne(
    `SELECT
      a.*,
      s.name,
      s.sic_number,
      s.department,
      s.year
     FROM quiz_attempts a
     JOIN students s ON a.student_id = s.id
     WHERE a.id = ?`,
    [attemptId]
  );

  if (!attempt) return null;

  const answers = queryAll(
    `SELECT
      ans.id,
      ans.question_id,
      ans.selected_answer,
      ans.is_correct,
      ans.time_taken,
      ans.answered_at,
      q.question_text,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      q.correct_answer,
      q.explanation,
      q.difficulty,
      q.topic
     FROM quiz_answers ans
     JOIN questions q ON ans.question_id = q.id
     WHERE ans.attempt_id = ?
     ORDER BY ans.id ASC`,
    [attemptId]
  );

  return { attempt, answers };
}

export function getAllQuestions(topic?: string) {
  if (topic) {
    return queryAll('SELECT * FROM questions WHERE topic = ? ORDER BY id ASC', [topic]);
  }
  return queryAll('SELECT * FROM questions ORDER BY topic, id ASC');
}

export function addQuestion(data: {
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
}) {
  const validTopics = ['Python Lists', 'Python Variables', 'Python Operators'];
  if (!validTopics.includes(data.topic)) {
    throw new Error('Topic must be one of: "Python Lists", "Python Variables", "Python Operators"');
  }

  const validDiffs = ['Easy', 'Medium', 'Hard'];
  if (!validDiffs.includes(data.difficulty)) {
    throw new Error('Difficulty must be Easy, Medium, or Hard');
  }

  const validAnswers = ['A', 'B', 'C', 'D'];
  const ans = data.correct_answer.trim().toUpperCase();
  if (!validAnswers.includes(ans)) {
    throw new Error('Correct answer must be A, B, C, or D');
  }

  const res = runQuery(
    `INSERT INTO questions (
      topic, question_text, option_a, option_b, option_c, option_d,
      correct_answer, explanation, difficulty, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      data.topic,
      data.question_text.trim(),
      data.option_a.trim(),
      data.option_b.trim(),
      data.option_c.trim(),
      data.option_d.trim(),
      ans,
      data.explanation.trim(),
      data.difficulty
    ]
  );

  saveDb();
  return { id: res.lastInsertRowid };
}

export function updateQuestion(id: number, data: Partial<{
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  is_active: number;
}>) {
  const existing = queryOne('SELECT * FROM questions WHERE id = ?', [id]);
  if (!existing) {
    throw new Error('Question not found');
  }

  const topic = data.topic !== undefined ? data.topic : existing.topic;
  const question_text = data.question_text !== undefined ? data.question_text.trim() : existing.question_text;
  const option_a = data.option_a !== undefined ? data.option_a.trim() : existing.option_a;
  const option_b = data.option_b !== undefined ? data.option_b.trim() : existing.option_b;
  const option_c = data.option_c !== undefined ? data.option_c.trim() : existing.option_c;
  const option_d = data.option_d !== undefined ? data.option_d.trim() : existing.option_d;
  const correct_answer = data.correct_answer !== undefined ? data.correct_answer.trim().toUpperCase() : existing.correct_answer;
  const explanation = data.explanation !== undefined ? data.explanation.trim() : existing.explanation;
  const difficulty = data.difficulty !== undefined ? data.difficulty : existing.difficulty;
  const is_active = data.is_active !== undefined ? Number(data.is_active) : existing.is_active;

  runQuery(
    `UPDATE questions SET
      topic = ?,
      question_text = ?,
      option_a = ?,
      option_b = ?,
      option_c = ?,
      option_d = ?,
      correct_answer = ?,
      explanation = ?,
      difficulty = ?,
      is_active = ?
     WHERE id = ?`,
    [
      topic,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
      difficulty,
      is_active,
      id
    ]
  );

  saveDb();
  return { success: true };
}

export function deleteQuestion(id: number) {
  const existing = queryOne('SELECT * FROM questions WHERE id = ?', [id]);
  if (!existing) {
    throw new Error('Question not found');
  }

  runQuery('DELETE FROM questions WHERE id = ?', [id]);
  saveDb();
  return { success: true };
}

export function resetAttempt(attemptId: number) {
  const attempt = queryOne<{ student_id: number }>('SELECT student_id FROM quiz_attempts WHERE id = ?', [attemptId]);
  if (!attempt) {
    throw new Error('Attempt not found');
  }

  runQuery('DELETE FROM quiz_answers WHERE attempt_id = ?', [attemptId]);
  runQuery('DELETE FROM quiz_attempts WHERE id = ?', [attemptId]);
  runQuery('DELETE FROM student_rewards WHERE student_id = ?', [attempt.student_id]);
  runQuery('DELETE FROM students WHERE id = ?', [attempt.student_id]);
  saveDb();
  return { success: true, message: 'Attempt and student records reset successfully. SIC is unlocked.' };
}
