import { Router, Request, Response } from 'express';
import { registerOrCheckStudent, checkSicStatus } from '../services/quizService.ts';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, sicNumber, department, year } = req.body;
    if (!name || !sicNumber || !department || !year) {
      return res.status(400).json({ error: 'All fields (Name, SIC Number, Department, Year) are required.' });
    }

    const result = registerOrCheckStudent(name, sicNumber, department, year);

    if (!result.allowed) {
      return res.status(403).json({
        error: 'Quiz Already Attempted',
        reason: result.reason,
        message: result.message
      });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/status/:sic', (req: Request, res: Response) => {
  try {
    const { sic } = req.params;
    if (!sic) {
      return res.status(400).json({ error: 'SIC is required' });
    }
    const status = checkSicStatus(sic);
    res.json(status);
  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
