
import express from 'express';
import cors from 'cors';
import searchRouter from './routes/search.js';
import summarizeRouter from './routes/summarize.js';
import critiqueRouter from './routes/critique.js';
import slidesRouter from './routes/slides.js';
import paperRouter from './routes/paper.js';
import adminRouter from './routes/admin.js';
import accountRouter from './routes/account.js';
import { connectDB, isDbConnected } from './config/db.js';
import { hasSemanticScholarApiKey } from './utils/semanticScholar.js';

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : ['*'];

const app = express();
app.use(
  cors({
    origin: corsOrigins.length === 1 && corsOrigins[0] === '*'
      ? '*'
      : (origin, callback) => {
          if (!origin || corsOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-With',
    ],
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, dbConnected: isDbConnected() });
});

app.use('/api/search', searchRouter);
app.use('/api/summarize', summarizeRouter);
app.use('/api/critique', critiqueRouter);
app.use('/api/slides', slidesRouter);
app.use('/api/paper', paperRouter);
app.use('/api/admin', adminRouter);
app.use('/api/account', accountRouter);

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        hasSemanticScholarApiKey()
          ? 'Semantic Scholar API key loaded'
          : 'Semantic Scholar: no API key (public rate limits apply)'
      );
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
