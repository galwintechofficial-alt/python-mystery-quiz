import express from 'express';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/database/db.ts';
import { seedDatabase } from './server/database/seed.ts';
import studentRoutes from './server/routes/studentRoutes.ts';
import quizRoutes from './server/routes/quizRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import path from 'path';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Endpoints
app.use('/api/students', studentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Python Mystery Quiz',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  try {
    // Initialize SQLite & Seed initial 60 questions + admin
    await getDb();
    await seedDatabase();

    const isProd = process.env.NODE_ENV === 'production';

    if (!isProd) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distDir = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Python Mystery Quiz server is active on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal server boot error:', err);
    process.exit(1);
  }
}

startServer();
