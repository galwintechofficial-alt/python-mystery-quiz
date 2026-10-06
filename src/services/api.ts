import { QuestionFull, StudentResultRow, AdminStats, RankingRow } from '../types/index.ts';

const BASE_URL = '/api';

export async function registerStudentApi(data: {
  name: string;
  sicNumber: string;
  department: string;
  year: string;
}) {
  const res = await fetch(`${BASE_URL}/students/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || 'Failed to register student');
  }
  return json;
}

export async function checkSicStatusApi(sic: string) {
  const res = await fetch(`${BASE_URL}/students/status/${encodeURIComponent(sic)}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to check SIC status');
  }
  return json;
}

export async function startQuizApi(sicNumber: string, topic: string) {
  const res = await fetch(`${BASE_URL}/quiz/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sicNumber, topic }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to start quiz');
  }
  return json;
}

export async function submitAnswerApi(data: {
  attemptId: number;
  sicNumber: string;
  questionId: number;
  selectedAnswer: string | null;
  timeTaken: number;
}) {
  const res = await fetch(`${BASE_URL}/quiz/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to submit answer');
  }
  return json;
}

export async function completeQuizApi(attemptId: number, sicNumber: string) {
  const res = await fetch(`${BASE_URL}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attemptId, sicNumber }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to complete quiz');
  }
  return json;
}

export async function autoSubmitQuizApi(attemptId: number, sicNumber: string, reason?: string) {
  const res = await fetch(`${BASE_URL}/quiz/auto-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attemptId, sicNumber, reason }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to auto-submit quiz');
  }
  return json;
}

// Admin APIs
export async function adminLoginApi(credentials: { username: string; password: string }) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Invalid credentials');
  }
  return json;
}

export async function getAdminStatsApi(token: string): Promise<AdminStats> {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch stats');
  }
  return json;
}

export async function getAdminResultsApi(token: string, filters: Record<string, any> = {}): Promise<{ results: StudentResultRow[] }> {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });

  const res = await fetch(`${BASE_URL}/admin/results?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch results');
  }
  return json;
}

export async function getAdminRankingApi(token: string): Promise<{ ranking: RankingRow[] }> {
  const res = await fetch(`${BASE_URL}/admin/ranking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch ranking');
  }
  return json;
}

export async function getAttemptDetailApi(token: string, attemptId: number) {
  const res = await fetch(`${BASE_URL}/admin/attempt/${attemptId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch attempt detail');
  }
  return json;
}

export async function getAdminQuestionsApi(token: string, topic?: string): Promise<{ questions: QuestionFull[] }> {
  const url = topic ? `${BASE_URL}/admin/questions?topic=${encodeURIComponent(topic)}` : `${BASE_URL}/admin/questions`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch questions');
  }
  return json;
}

export async function createAdminQuestionApi(token: string, question: Omit<QuestionFull, 'id' | 'created_at'>) {
  const res = await fetch(`${BASE_URL}/admin/questions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to create question');
  }
  return json;
}

export async function updateAdminQuestionApi(token: string, id: number, question: Partial<QuestionFull>) {
  const res = await fetch(`${BASE_URL}/admin/questions/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update question');
  }
  return json;
}

export async function deleteAdminQuestionApi(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/admin/questions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete question');
  }
  return json;
}

export async function resetStudentAttemptApi(token: string, attemptId: number) {
  const res = await fetch(`${BASE_URL}/admin/attempt/${attemptId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to reset attempt');
  }
  return json;
}
