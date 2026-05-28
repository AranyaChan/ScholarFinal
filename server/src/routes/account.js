import express from 'express';
import SearchHistory from '../models/SearchHistory.js';
import PaperSelection from '../models/PaperSelection.js';

const router = express.Router();

// GET /api/account/search-history?userId=...&limit=25
router.get('/search-history', async (req, res) => {
  const { userId } = req.query;
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(parsedLimit) ? 25 : Math.min(Math.max(parsedLimit, 1), 100);

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing userId query parameter' });
  }

  try {
    const items = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({
        _id: 0,
        query: 1,
        searchSource: 1,
        sortBy: 1,
        resultCount: 1,
        warnings: 1,
        createdAt: 1,
      });

    res.json({ ok: true, count: items.length, items });
  } catch (err) {
    console.error('Failed to load account history:', err.message);
    res.status(500).json({ error: 'Failed to load search history' });
  }
});

// GET /api/account/paper-selections?userId=...&limit=25
router.get('/paper-selections', async (req, res) => {
  const { userId } = req.query;
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(parsedLimit) ? 25 : Math.min(Math.max(parsedLimit, 1), 100);

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing userId query parameter' });
  }

  try {
    const rows = await PaperSelection.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({ _id: 0, paper: 1, createdAt: 1 });

    const items = rows.map((row) => ({
      ...row.paper,
      selectedAt: row.createdAt,
    }));

    res.json({ ok: true, count: items.length, items });
  } catch (err) {
    console.error('Failed to load paper selections:', err.message);
    res.status(500).json({ error: 'Failed to load selected papers' });
  }
});

export default router;
