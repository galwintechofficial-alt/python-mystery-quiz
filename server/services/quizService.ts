import { queryAll, queryOne, runQuery, saveDb } from '../database/db.ts';

export const VALID_TOPICS = ['Python Lists', 'Python Variables', 'Python Operators'] as const;
export type TopicType = typeof VALID_TOPICS[number];

export function getStudentLevel(coins: number): { level: number; title: string; avatar: string } {
  if (coins >= 180) {
    return { level: 4, title: 'Quiz Master', avatar: '🏆' };
  } else if (coins >= 120) {
    return { level: 3, title: 'Python Explorer', avatar: '🧑‍💻' };
  } else if (coins >= 50) {
    return { level: 2, title: 'Learner', avatar: '👨‍💻' };
  }
  return { level: 1, title: 'Beginner', avatar: '🧑‍🎓' };
}

export function registerOrCheckStudent(name: string, sicNumber: string, department: string, year: string) {
  const normalizedSic = sicNumber.trim().toUpperCase();
  const cleanName = name.trim();
  const cleanDept = department.trim();
  const cleanYear = year.trim();

  if (!cleanName || !normalizedSic || !cleanDept || !cleanYear) {
    throw new Error('All fields (Name, SIC Number, Department, Year) are mandatory');
  }

  // Check if student exists
  let student = queryOne<{ id: number; name: string; sic_number: string; department: string; year: string }>(
    'SELECT * FROM students WHERE sic_number = ?',
    [normalizedSic]
  );

  if (student) {
    // Check if the student has any completed or auto-submitted attempts
    const lockedAttempt = queryOne<{ id: number; status: string; auto_submitted: number }>(
      "SELECT id, status, auto_submitted FROM quiz_attempts WHERE student_id = ? AND status IN ('COMPLETED', 'AUTO_SUBMITTED')",
      [student.id]
    );

    if (lockedAttempt) {
      return {
        allowed: false,
        reason: 'ALREADY_COMPLETED',
        message: 'This SIC number has already been used for this quiz. You cannot attempt the quiz again.'
      };
    }

    // Check if there is an in-progress attempt
    const inProgressAttempt = queryOne<{ id: number; topic: string; status: string }>(
      "SELECT id, topic, status FROM quiz_attempts WHERE student_id = ? AND status = 'IN_PROGRESS'",
      [student.id]
    );

    if (inProgressAttempt) {
      return {
        allowed: true,
        student,
        inProgress: true,
        attemptId: inProgressAttempt.id,
        topic: inProgressAttempt.topic
      };
    }
  } else {
    // Insert new student
    const result = runQuery(
      'INSERT INTO students (name, sic_number, department, year) VALUES (?, ?, ?, ?)',
      [cleanName, normalizedSic, cleanDept, cleanYear]
    );
    student = {
      id: result.lastInsertRowid,
      name: cleanName,
      sic_number: normalizedSic,
      department: cleanDept,
      year: cleanYear
    };

    // Initialize rewards
    runQuery(
      'INSERT INTO student_rewards (student_id, coins, level, avatar, current_streak, max_streak) VALUES (?, 0, 1, "beginner", 0, 0)',
      [student.id]
    );
  }

  return {
    allowed: true,
    student,
    inProgress: false
  };
}

export function checkSicStatus(sicNumber: string) {
  const normalizedSic = sicNumber.trim().toUpperCase();
  const student = queryOne<{ id: number; name: string; sic_number: string }>(
    'SELECT * FROM students WHERE sic_number = ?',
    [normalizedSic]
  );

  if (!student) {
    return { exists: false, status: 'NOT_STARTED' };
  }

  const completedAttempt = queryOne<{ id: number; status: string; auto_submitted: number }>(
    "SELECT id, status, auto_submitted FROM quiz_attempts WHERE student_id = ? AND status IN ('COMPLETED', 'AUTO_SUBMITTED')",
    [student.id]
  );

  if (completedAttempt) {
    return {
      exists: true,
      status: completedAttempt.status,
      locked: true,
      message: 'This SIC number has already been used for this quiz. You cannot attempt the quiz again.'
    };
  }

  const inProgressAttempt = queryOne<{ id: number; topic: string; status: string }>(
    "SELECT id, topic, status FROM quiz_attempts WHERE student_id = ? AND status = 'IN_PROGRESS'",
    [student.id]
  );

  if (inProgressAttempt) {
    return {
      exists: true,
      status: 'IN_PROGRESS',
      locked: false,
      attemptId: inProgressAttempt.id,
      topic: inProgressAttempt.topic
    };
  }

  return { exists: true, status: 'NOT_STARTED', locked: false };
}

export function startQuizAttempt(sicNumber: string, topic: string) {
  const normalizedSic = sicNumber.trim().toUpperCase();

  if (!VALID_TOPICS.includes(topic as TopicType)) {
    throw new Error('Invalid topic selection. Must be one of the three mystery boxes.');
  }

  const student = queryOne<{ id: number; name: string; sic_number: string }>(
    'SELECT * FROM students WHERE sic_number = ?',
    [normalizedSic]
  );

  if (!student) {
    throw new Error('Student not found. Please register first.');
  }

  // Check if student has already completed or auto-submitted
  const existingAttempt = queryOne<{ id: number; status: string }>(
    "SELECT id, status FROM quiz_attempts WHERE student_id = ? AND status IN ('COMPLETED', 'AUTO_SUBMITTED')",
    [student.id]
  );

  if (existingAttempt) {
    throw new Error('This SIC number has already been used for this quiz. You cannot attempt the quiz again.');
  }

  // Check if there is already an IN_PROGRESS attempt
  let activeAttempt = queryOne<{
    id: number;
    student_id: number;
    topic: string;
    status: string;
    lives_remaining: number;
    coins_earned: number;
    current_streak: number;
    max_streak: number;
  }>(
    "SELECT * FROM quiz_attempts WHERE student_id = ? AND status = 'IN_PROGRESS'",
    [student.id]
  );

  if (!activeAttempt) {
    const res = runQuery(
      `INSERT INTO quiz_attempts (
        student_id, topic, status, score, correct_count, wrong_count, unanswered_count,
        lives_remaining, coins_earned, current_streak, max_streak, tab_switch_count,
        auto_submitted, started_at
      ) VALUES (?, ?, 'IN_PROGRESS', 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP)`,
      [student.id, topic]
    );

    activeAttempt = {
      id: res.lastInsertRowid,
      student_id: student.id,
      topic,
      status: 'IN_PROGRESS',
      lives_remaining: 3,
      coins_earned: 0,
      current_streak: 0,
      max_streak: 0
    };
  }

  // Retrieve active questions for the topic
  // Note: NEVER include correct_answer or explanation in the student response!
  const questions = queryAll<{
    id: number;
    topic: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    difficulty: string;
  }>(
    'SELECT id, topic, question_text, option_a, option_b, option_c, option_d, difficulty FROM questions WHERE topic = ? AND is_active = 1 ORDER BY id ASC LIMIT 20',
    [activeAttempt.topic]
  );

  if (questions.length !== 20) {
    throw new Error(`Invalid question bank for topic "${activeAttempt.topic}". Found ${questions.length} questions, expected 20.`);
  }

  // Fetch already answered questions if resuming
  const answeredRows = queryAll<{ question_id: number; selected_answer: string }>(
    'SELECT question_id, selected_answer FROM quiz_answers WHERE attempt_id = ?',
    [activeAttempt.id]
  );

  const answeredMap: Record<number, string> = {};
  answeredRows.forEach(row => {
    answeredMap[row.question_id] = row.selected_answer;
  });

  const rewards = queryOne<{ coins: number; current_streak: number; max_streak: number }>(
    'SELECT coins, current_streak, max_streak FROM student_rewards WHERE student_id = ?',
    [student.id]
  );

  const levelInfo = getStudentLevel(rewards ? rewards.coins : 0);

  return {
    attemptId: activeAttempt.id,
    topic: activeAttempt.topic,
    livesRemaining: activeAttempt.lives_remaining,
    coinsEarned: activeAttempt.coins_earned,
    currentStreak: activeAttempt.current_streak,
    maxStreak: activeAttempt.max_streak,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    avatar: levelInfo.avatar,
    questions,
    answeredQuestions: answeredMap
  };
}

export function recordQuestionAnswer(
  attemptId: number,
  sicNumber: string,
  questionId: number,
  selectedAnswer: string | null,
  timeTaken: number
) {
  const normalizedSic = sicNumber.trim().toUpperCase();

  const attempt = queryOne<{
    id: number;
    student_id: number;
    topic: string;
    status: string;
    lives_remaining: number;
    coins_earned: number;
    current_streak: number;
    max_streak: number;
    score: number;
    correct_count: number;
    wrong_count: number;
    unanswered_count: number;
  }>('SELECT a.* FROM quiz_attempts a JOIN students s ON a.student_id = s.id WHERE a.id = ? AND s.sic_number = ?', [
    attemptId,
    normalizedSic
  ]);

  if (!attempt) {
    throw new Error('Attempt not found or invalid SIC');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error('This quiz attempt is already finalized and cannot accept answers.');
  }

  // Check if already answered
  const existingAnswer = queryOne('SELECT id FROM quiz_answers WHERE attempt_id = ? AND question_id = ?', [
    attemptId,
    questionId
  ]);

  if (existingAnswer) {
    throw new Error('This question has already been answered.');
  }

  // Fetch true correct answer from database
  const question = queryOne<{ id: number; correct_answer: string }>(
    'SELECT id, correct_answer FROM questions WHERE id = ?',
    [questionId]
  );

  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = selectedAnswer && selectedAnswer.trim().toUpperCase() === question.correct_answer.toUpperCase() ? 1 : 0;
  let newLives = attempt.lives_remaining;
  let newCurrentStreak = attempt.current_streak;
  let newMaxStreak = attempt.max_streak;
  let newCoins = attempt.coins_earned;
  let newScore = attempt.score;
  let newCorrectCount = attempt.correct_count;
  let newWrongCount = attempt.wrong_count;
  let newUnansweredCount = attempt.unanswered_count;

  if (isCorrect) {
    newScore += 10;
    newCorrectCount += 1;
    newCurrentStreak += 1;
    newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);
    // +10 coins, +5 bonus if streak >= 3
    const streakBonus = newCurrentStreak >= 3 ? 5 : 0;
    newCoins += 10 + streakBonus;
  } else {
    newCurrentStreak = 0;
    if (selectedAnswer) {
      newWrongCount += 1;
      newLives = Math.max(0, newLives - 1);
    } else {
      newUnansweredCount += 1;
    }
  }

  // Insert into quiz_answers
  runQuery(
    `INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct, time_taken, answered_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [attemptId, questionId, selectedAnswer || null, isCorrect, Math.min(10, Math.max(0, timeTaken))]
  );

  // Update quiz_attempts
  runQuery(
    `UPDATE quiz_attempts SET
      score = ?,
      correct_count = ?,
      wrong_count = ?,
      unanswered_count = ?,
      lives_remaining = ?,
      coins_earned = ?,
      current_streak = ?,
      max_streak = ?
     WHERE id = ?`,
    [
      newScore,
      newCorrectCount,
      newWrongCount,
      newUnansweredCount,
      newLives,
      newCoins,
      newCurrentStreak,
      newMaxStreak,
      attemptId
    ]
  );

  // Update student_rewards
  const levelInfo = getStudentLevel(newCoins);
  runQuery(
    `UPDATE student_rewards SET
      coins = ?,
      level = ?,
      avatar = ?,
      current_streak = ?,
      max_streak = ?
     WHERE student_id = ?`,
    [newCoins, levelInfo.level, levelInfo.avatar, newCurrentStreak, newMaxStreak, attempt.student_id]
  );

  saveDb();

  // Return feedback for animation (WITHOUT correct answer text and WITHOUT score!)
  return {
    success: true,
    isCorrect: Boolean(isCorrect),
    livesRemaining: newLives,
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    coinsEarned: newCoins,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    avatar: levelInfo.avatar
  };
}

export function completeQuizAttempt(attemptId: number, sicNumber: string) {
  const normalizedSic = sicNumber.trim().toUpperCase();

  const attempt = queryOne<{ id: number; student_id: number; status: string; coins_earned: number; max_streak: number }>(
    'SELECT a.id, a.student_id, a.status, a.coins_earned, a.max_streak FROM quiz_attempts a JOIN students s ON a.student_id = s.id WHERE a.id = ? AND s.sic_number = ?',
    [attemptId, normalizedSic]
  );

  if (!attempt) {
    throw new Error('Attempt not found or invalid SIC');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    return {
      success: true,
      alreadySubmitted: true,
      message: 'Quiz has already been submitted.'
    };
  }

  runQuery(
    `UPDATE quiz_attempts SET
      status = 'COMPLETED',
      submitted_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [attemptId]
  );

  saveDb();

  const levelInfo = getStudentLevel(attempt.coins_earned);

  return {
    success: true,
    message: 'Your response has been successfully recorded.',
    coinsEarned: attempt.coins_earned,
    maxStreak: attempt.max_streak,
    levelTitle: levelInfo.title,
    avatar: levelInfo.avatar
  };
}

export function autoSubmitQuizAttempt(attemptId: number, sicNumber: string, reason: string = 'Tab switch / left quiz window') {
  const normalizedSic = sicNumber.trim().toUpperCase();

  const attempt = queryOne<{ id: number; student_id: number; status: string; tab_switch_count: number }>(
    'SELECT a.id, a.student_id, a.status, a.tab_switch_count FROM quiz_attempts a JOIN students s ON a.student_id = s.id WHERE a.id = ? AND s.sic_number = ?',
    [attemptId, normalizedSic]
  );

  if (!attempt) {
    throw new Error('Attempt not found or invalid SIC');
  }

  if (attempt.status === 'COMPLETED' || attempt.status === 'AUTO_SUBMITTED') {
    return {
      success: true,
      alreadyLocked: true,
      message: 'This quiz was already submitted and locked.'
    };
  }

  runQuery(
    `UPDATE quiz_attempts SET
      status = 'AUTO_SUBMITTED',
      auto_submitted = 1,
      submission_reason = ?,
      tab_switch_count = tab_switch_count + 1,
      submitted_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [reason, attemptId]
  );

  saveDb();

  return {
    success: true,
    autoSubmitted: true,
    message: 'Your quiz was automatically submitted because you left the quiz window.'
  };
}
