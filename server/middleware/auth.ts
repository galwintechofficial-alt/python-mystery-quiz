import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'python-mystery-quiz-secret-salt-2026-key';

// Token format: base64(userId:username:timestamp):hmacSignature
export function generateAdminToken(admin: { id: number; username: string }): string {
  const payload = `${admin.id}:${admin.username}:${Date.now()}`;
  const encodedPayload = Buffer.from(payload).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(encodedPayload).digest('hex');
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token: string): { id: number; username: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(encodedPayload).digest('hex');
    if (signature !== expectedSignature) {
      return null;
    }
    const decoded = Buffer.from(encodedPayload, 'base64').toString('utf8');
    const [idStr, username, timestampStr] = decoded.split(':');
    const timestamp = parseInt(timestampStr, 10);
    // Token valid for 24 hours
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    return { id: parseInt(idStr, 10), username };
  } catch {
    return null;
  }
}

export interface AdminAuthRequest extends Request {
  admin?: { id: number; username: string };
}

export function requireAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const admin = verifyAdminToken(token);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.admin = admin;
  next();
}
